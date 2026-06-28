// Centraliza validacion, registro concurrente y publicacion en tiempo real de pujas.
package com.bidowl.auctionplace.service;

import com.bidowl.auctionplace.dto.LimitesPujaDTO;
import com.bidowl.auctionplace.dto.PujaWebSocketEventDTO;
import com.bidowl.auctionplace.entity.Asistente;
import com.bidowl.auctionplace.entity.Cliente;
import com.bidowl.auctionplace.entity.ItemCatalogo;
import com.bidowl.auctionplace.entity.MetodoPago;
import com.bidowl.auctionplace.entity.Pujo;
import com.bidowl.auctionplace.entity.Subasta;
import com.bidowl.auctionplace.repository.AsistenteRepository;
import com.bidowl.auctionplace.repository.ClienteRepository;
import com.bidowl.auctionplace.repository.ItemCatalogoRepository;
import com.bidowl.auctionplace.repository.PujoRepository;
import com.bidowl.auctionplace.repository.SubastaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

@Service
public class PujoService {

    private static final ZoneId ARGENTINA_ZONE = ZoneId.of("America/Argentina/Buenos_Aires");

    @Autowired
    private PujoRepository pujoRepository;

    @Autowired
    private AsistenteRepository asistenteRepository;

    @Autowired
    private ItemCatalogoRepository itemCatalogoRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private SubastaRepository subastaRepository;

    @Autowired
    private MetodoPagoValidationService metodoPagoValidationService;

    @Autowired
    private ChequeCompromisoService chequeCompromisoService;

    @Autowired
    private ClientePenalizacionService clientePenalizacionService;

    @Autowired
    private CategoryRankService categoryRankService;

    @Autowired
    private ItemCatalogoService itemCatalogoService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public List<Pujo> obtenerHistorial(Integer itemId) {
        return pujoRepository.findByItemIdentificadorOrderByImporteDesc(itemId);
    }

    public Optional<Pujo> obtenerPujaMaxima(Integer itemId) {
        return pujoRepository.findFirstByItemIdentificadorOrderByImporteDesc(itemId);
    }

    public LimitesPujaDTO obtenerLimitesPuja(Integer itemId) {
        ItemCatalogo itemCatalogo = itemCatalogoRepository.findById(itemId)
                .orElseThrow(() -> new java.util.NoSuchElementException("Item con ID " + itemId + " no encontrado"));
        return calcularLimites(itemCatalogo);
    }

    public Optional<ItemCatalogo> buscarItemEnSubasta(Integer idSubasta, Integer iditem) {
        if (idSubasta == null || iditem == null) {
            return Optional.empty();
        }
        return itemCatalogoRepository.findByIdentificadorAndCatalogo_Subasta_Identificador(iditem, idSubasta);
    }

    public boolean subastaEstaCerrada(Integer idSubasta) {
        if (idSubasta == null) {
            return false;
        }
        return subastaRepository.findById(idSubasta)
                .map(subasta -> !"abierta".equalsIgnoreCase(subasta.getEstado()))
                .orElse(false);
    }

    @Transactional
    public Pujo registrarPujaEnSubasta(Integer idSubasta, Integer iditem, BigDecimal monto, String idMetodoPago, Integer clienteId) {
        if (monto == null || monto.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El monto debe ser mayor a 0");
        }

        ItemCatalogo itemCatalogo = itemCatalogoRepository
                .findByIdentificadorAndSubastaForUpdate(iditem, idSubasta)
                .orElseThrow(() -> new java.util.NoSuchElementException(
                        "Item con ID " + iditem + " no encontrado en la subasta " + idSubasta));

        Subasta subasta = subastaRepository.findById(idSubasta)
                .orElseThrow(() -> new IllegalStateException("La subasta no existe o no esta abierta"));
        if (!"abierta".equalsIgnoreCase(subasta.getEstado())) {
            throw new IllegalStateException("La subasta no existe o no esta abierta");
        }

        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new java.util.NoSuchElementException("Cliente no encontrado: " + clienteId));

        validarClientePuedePujar(cliente, subasta, itemCatalogo);
        validarLoteHabilitado(idSubasta, iditem);
        validarItemNoFinalizado(itemCatalogo, idSubasta, iditem);

        MetodoPago metodoPago = metodoPagoValidationService
                .obtenerCompatibleParaPuja(clienteId, idMetodoPago, subasta, monto, iditem);

        validarMontoPermitido(itemCatalogo, monto);

        Asistente asistente = getOrCreateAsistente(cliente, subasta);
        itemCatalogo.setFechaFinPuja(fechaHoraArgentina().plusMinutes(1));
        itemCatalogoRepository.save(itemCatalogo);

        Pujo puja = new Pujo();
        puja.setAsistente(asistente);
        puja.setItem(itemCatalogo);
        puja.setImporte(monto);
        puja.setGanador("no");
        puja.setFechaHora(fechaHoraArgentina());
        puja.setMetodoPago(metodoPago);

        Pujo pujaGuardada = pujoRepository.save(puja);
        chequeCompromisoService.registrarCompromisoParaPuja(pujaGuardada);

        cliente.setPujasRealizadas((cliente.getPujasRealizadas() != null ? cliente.getPujasRealizadas() : 0) + 1);
        clienteRepository.save(cliente);

        publicarEventoNuevaPuja(idSubasta, pujaGuardada);

        return pujaGuardada;
    }

    private void publicarEventoNuevaPuja(Integer subastaId, Pujo puja) {
        Integer itemId = puja != null && puja.getItem() != null ? puja.getItem().getIdentificador() : null;
        PujaWebSocketEventDTO event = PujaWebSocketEventDTO.nuevaPuja(subastaId, puja, obtenerMoneda(puja));
        messagingTemplate.convertAndSend("/topic/subasta/" + subastaId, event);
        if (itemId != null) {
            messagingTemplate.convertAndSend("/topic/subasta/" + subastaId + "/items/" + itemId, event);
        }

        if (subastaEstaCerrada(subastaId)) {
            PujaWebSocketEventDTO cierre = PujaWebSocketEventDTO.subastaCerrada(subastaId, "La subasta ha finalizado.");
            messagingTemplate.convertAndSend("/topic/subasta/" + subastaId, cierre);
            if (itemId != null) {
                messagingTemplate.convertAndSend("/topic/subasta/" + subastaId + "/items/" + itemId, cierre);
            }
        }
    }

    private String obtenerMoneda(Pujo pujo) {
        if (pujo == null
                || pujo.getItem() == null
                || pujo.getItem().getCatalogo() == null
                || pujo.getItem().getCatalogo().getSubasta() == null) {
            return null;
        }
        return pujo.getItem().getCatalogo().getSubasta().getMoneda();
    }

    @Transactional
    public Pujo registrarPujaDesdeAsistente(Integer asistenteId, Integer idSubasta, Integer itemId, BigDecimal importe, String idMetodoPago) {
        Asistente asistente = asistenteRepository.findById(asistenteId)
                .orElseThrow(() -> new java.util.NoSuchElementException("Asistente no registrado en esta subasta."));
        if (asistente.getSubasta() == null || !asistente.getSubasta().getIdentificador().equals(idSubasta)) {
            throw new IllegalArgumentException("El asistente no pertenece a la subasta indicada.");
        }
        return registrarPujaEnSubasta(idSubasta, itemId, importe, idMetodoPago, asistente.getCliente().getIdentificador());
    }

    public Integer obtenerClienteIdDesdeAsistente(Integer asistenteId, Integer idSubasta) {
        Asistente asistente = asistenteRepository.findById(asistenteId)
                .orElseThrow(() -> new java.util.NoSuchElementException("Asistente no registrado en esta subasta."));
        if (asistente.getSubasta() == null || !asistente.getSubasta().getIdentificador().equals(idSubasta)) {
            throw new IllegalArgumentException("El asistente no pertenece a la subasta indicada.");
        }
        if (asistente.getCliente() == null) {
            throw new java.util.NoSuchElementException("Cliente no encontrado para el asistente indicado.");
        }
        return asistente.getCliente().getIdentificador();
    }

    private void validarClientePuedePujar(Cliente cliente, Subasta subasta, ItemCatalogo itemCatalogo) {
        clientePenalizacionService.validarClienteSinBloqueo(cliente.getIdentificador());
        if (itemCatalogo.getProducto() != null
                && itemCatalogo.getProducto().getDuenio() != null
                && itemCatalogo.getProducto().getDuenio().getIdentificador().equals(cliente.getIdentificador())) {
            throw new IllegalArgumentException("No puedes pujar por un articulo de tu propiedad.");
        }
        if (categoryRankService.getRank(cliente.getCategoriaCliente()) < categoryRankService.getRank(subasta.getCategoria())) {
            throw new IllegalArgumentException("Categoria de cliente insuficiente.");
        }
    }

    private void validarLoteHabilitado(Integer idSubasta, Integer iditem) {
        List<ItemCatalogo> todosLosItems = itemCatalogoRepository.findByCatalogoSubastaIdentificador(idSubasta);
        todosLosItems.sort(java.util.Comparator.comparing(ItemCatalogo::getIdentificador));
        for (ItemCatalogo item : todosLosItems) {
            if (item.getIdentificador().equals(iditem)) {
                return;
            }
            if (!"si".equalsIgnoreCase(item.getSubastado())) {
                throw new IllegalStateException("No se puede pujar sobre este lote porque el lote anterior aun no ha finalizado.");
            }
        }
    }

    private void validarItemNoFinalizado(ItemCatalogo itemCatalogo, Integer idSubasta, Integer iditem) {
        if (itemCatalogo.getFechaFinPuja() != null && fechaHoraArgentina().isAfter(itemCatalogo.getFechaFinPuja())) {
            try {
                itemCatalogoService.finalizarSubastaDeItem(iditem);
            } catch (Exception e) {
                itemCatalogo.setSubastado("si");
                itemCatalogoRepository.save(itemCatalogo);
                Optional<Pujo> pujaLider = pujoRepository.findFirstByItemIdentificadorOrderByImporteDesc(iditem);
                if (pujaLider.isPresent()) {
                    Pujo lider = pujaLider.get();
                    lider.setGanador("si");
                    pujoRepository.save(lider);
                    chequeCompromisoService.ejecutarCompromisoGanador(lider);
                }
            }
            throw new IllegalStateException("El remate de este articulo ha finalizado.");
        }
        if ("si".equalsIgnoreCase(itemCatalogo.getSubastado())) {
            throw new IllegalStateException("El remate de este articulo ha finalizado.");
        }
    }

    private void validarMontoPermitido(ItemCatalogo itemCatalogo, BigDecimal monto) {
        LimitesPujaDTO limites = calcularLimites(itemCatalogo);
        if (limites.getPujaMinima() != null && monto.compareTo(limites.getPujaMinima()) < 0) {
            throw new IllegalArgumentException("La puja es menor al minimo permitido: " + limites.getPujaMinima());
        }
        if (limites.getPujaMaxima() != null && monto.compareTo(limites.getPujaMaxima()) > 0) {
            throw new IllegalArgumentException("La puja excede el maximo permitido: " + limites.getPujaMaxima());
        }
    }

    private LimitesPujaDTO calcularLimites(ItemCatalogo itemCatalogo) {
        BigDecimal precioBase = itemCatalogo.getPrecioBase();
        Optional<Pujo> ultimaPujaOpt = pujoRepository.findFirstByItemIdentificadorOrderByImporteDesc(itemCatalogo.getIdentificador());

        String categoria = itemCatalogo.getCatalogo() != null && itemCatalogo.getCatalogo().getSubasta() != null
                ? itemCatalogo.getCatalogo().getSubasta().getCategoria()
                : null;
        boolean esCategoriaAlta = "oro".equalsIgnoreCase(categoria) || "platino".equalsIgnoreCase(categoria);

        BigDecimal pujaMinima;
        BigDecimal pujaMaxima;
        if (ultimaPujaOpt.isPresent()) {
            BigDecimal montoUltima = ultimaPujaOpt.get().getImporte();
            if (esCategoriaAlta) {
                pujaMinima = montoUltima.add(BigDecimal.valueOf(0.01));
                pujaMaxima = null;
            } else {
                pujaMinima = montoUltima.add(precioBase.multiply(BigDecimal.valueOf(0.01)));
                pujaMaxima = montoUltima.add(precioBase.multiply(BigDecimal.valueOf(0.20)));
            }
        } else {
            pujaMinima = precioBase;
            pujaMaxima = esCategoriaAlta ? null : precioBase.add(precioBase.multiply(BigDecimal.valueOf(0.20)));
        }

        LimitesPujaDTO limites = new LimitesPujaDTO();
        limites.setPujaMinima(pujaMinima);
        limites.setPujaMaxima(pujaMaxima);
        return limites;
    }

    private Asistente getOrCreateAsistente(Cliente cliente, Subasta subasta) {
        return asistenteRepository
                .findByClienteIdentificadorAndSubastaIdentificador(cliente.getIdentificador(), subasta.getIdentificador())
                .orElseGet(() -> {
                    Asistente nuevoAsistente = new Asistente();
                    nuevoAsistente.setCliente(cliente);
                    nuevoAsistente.setSubasta(subasta);
                    nuevoAsistente.setNumeroPostor(generarNumeroPostorUnico(subasta));

                    cliente.setRematesAsistidos((cliente.getRematesAsistidos() != null ? cliente.getRematesAsistidos() : 0) + 1);
                    clienteRepository.save(cliente);

                    return asistenteRepository.save(nuevoAsistente);
                });
    }

    private int generarNumeroPostorUnico(Subasta subasta) {
        int capacidad = subasta.getCapacidadAsistentes() != null ? subasta.getCapacidadAsistentes() : 100;
        List<Asistente> asistentesSubasta = asistenteRepository.findBySubastaIdentificador(subasta.getIdentificador());
        java.util.Set<Integer> numerosUsados = asistentesSubasta.stream()
                .map(Asistente::getNumeroPostor)
                .collect(java.util.stream.Collectors.toSet());
        if (numerosUsados.size() >= capacidad) {
            capacidad = capacidad * 2;
        }
        java.util.Random random = new java.util.Random();
        int numeroPostor;
        int intentos = 0;
        do {
            numeroPostor = random.nextInt(capacidad) + 1;
            intentos++;
        } while (numerosUsados.contains(numeroPostor) && intentos < 1000);
        return numeroPostor;
    }

    private LocalDateTime fechaHoraArgentina() {
        return LocalDateTime.now(ARGENTINA_ZONE);
    }
}
