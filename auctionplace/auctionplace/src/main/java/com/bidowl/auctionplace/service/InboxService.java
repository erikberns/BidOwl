package com.bidowl.auctionplace.service;

import com.bidowl.auctionplace.dto.MiSubastaDTO;
import com.bidowl.auctionplace.dto.NotificacionDTO;
import com.bidowl.auctionplace.dto.PujaActivaDTO;
import com.bidowl.auctionplace.dto.WonItemDetailDTO;
import com.bidowl.auctionplace.dto.HistorialPujaUsuarioDTO;
import com.bidowl.auctionplace.entity.Notificacion;
import com.bidowl.auctionplace.entity.Pujo;
import com.bidowl.auctionplace.entity.Producto;
import com.bidowl.auctionplace.entity.ItemCatalogo;
import com.bidowl.auctionplace.entity.Cliente;
import com.bidowl.auctionplace.repository.NotificacionRepository;
import com.bidowl.auctionplace.repository.PujoRepository;
import com.bidowl.auctionplace.repository.ProductoRepository;
import com.bidowl.auctionplace.entity.Foto;
import com.bidowl.auctionplace.repository.FotoRepository;
import com.bidowl.auctionplace.repository.ItemCatalogoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

import java.text.NumberFormat;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Servicio encargado de gestionar las notificaciones del buzón (inbox) del usuario,
 * incluyendo las pujas activas, subastas ganadas e historial de pujas.
 */
@Service
public class InboxService {

    @Autowired
    private NotificacionRepository notificacionRepository;

    @Autowired
    private PujoRepository pujoRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private ItemCatalogoRepository itemCatalogoRepository;

    @Autowired
    private FotoRepository fotoRepository;

    @Autowired
    private com.bidowl.auctionplace.repository.PropuestaComercialRepository propuestaComercialRepository;

    @Autowired
    private com.bidowl.auctionplace.repository.RegistroDeSubastaRepository registroDeSubastaRepository;

    @Autowired
    private MonedaService monedaService;

    @Autowired
    private ClientePenalizacionService clientePenalizacionService;

    public List<NotificacionDTO> obtenerNotificaciones(Integer personaId) {
        List<Notificacion> notificaciones = notificacionRepository.findByPersonaIdOrderByFechaDesc(personaId);
        return notificaciones.stream().map(n -> {
            NotificacionDTO dto = new NotificacionDTO();
            dto.setId(n.getIdentificador());
            dto.setTitulo(n.getTitulo());
            dto.setBody(n.getCuerpo());
            dto.setAction(n.getAccion());
            dto.setLeida(n.isLeida());
            dto.setFechaOriginal(n.getFecha());

            // Format relative time
            Duration duration = Duration.between(n.getFecha(), LocalDateTime.now());
            if (duration.toMinutes() < 60) {
                dto.setTiempoFormateado("Hace " + duration.toMinutes() + " Minutos");
            } else if (duration.toHours() < 24) {
                dto.setTiempoFormateado("Hace " + duration.toHours() + " Horas");
            } else {
                dto.setTiempoFormateado("Hace " + duration.toDays() + " Días");
            }

            String accion = n.getAccion();
            if (accion != null) {
                if (accion.startsWith("show_inspection_request")) {
                    dto.setButtonText("Ver resultado de solicitud de articulo");
                } else if (accion.startsWith("show_inspection_result")) {
                    String[] parts = accion.split(":");
                    boolean yaRespondida = false;
                    if (parts.length > 1) {
                        try {
                            Integer prodId = Integer.parseInt(parts[1]);
                            Optional<com.bidowl.auctionplace.entity.PropuestaComercial> propOpt = propuestaComercialRepository.findByProductoIdentificador(prodId);
                            if (propOpt.isPresent()) {
                                String est = propOpt.get().getEstado();
                                if ("ACEPTADA".equalsIgnoreCase(est) || "RECHAZADA".equalsIgnoreCase(est)) {
                                    yaRespondida = true;
                                }
                            }
                        } catch (Exception e) {
                            // Ignorar error de parseo o DB
                        }
                    }
                    if (yaRespondida) {
                        dto.setButtonText("Ver Detalles Oferta");
                    } else {
                        dto.setButtonText("Revisar Oferta del Articulo");
                    }
                } else if (accion.startsWith("show_inspection_rejected")) {
                    dto.setButtonText("Revisar Oferta del Articulo");
                } else if (accion.startsWith("show_bid_won")) {
                    dto.setButtonText("Ver Factura y Envio");
                }
            }

            return dto;
        }).collect(Collectors.toList());
    }

    public List<PujaActivaDTO> obtenerPujasActivas(Integer personaId) {
        // En una implementación completa esto haría JOIN con Asistente, ItemCatalogo y Subasta
        // Por ahora devolvemos la data mockeada como se solicitó para agilizar la demo,
        // pero preparada en el controlador para ser devuelta como JSON dinámico.
        
        List<PujaActivaDTO> pujas = new ArrayList<>();
        
        PujaActivaDTO puja1 = new PujaActivaDTO();
        puja1.setId(1);
        puja1.setSubastaTitle("Subasta de Colección Original Rolling Stone");
        puja1.setLote(1);
        puja1.setTotalLotes(5);
        puja1.setArticuloTitle("Guitarra de Keith Richards");
        puja1.setMiPuja("$1.000.000 ARS");
        puja1.setPujaMaxima("$1.115.000 ARS");
        puja1.setEstado("Activa");
        
        PujaActivaDTO puja2 = new PujaActivaDTO();
        puja2.setId(2);
        puja2.setSubastaTitle("Subasta de Colección Original Rolling Stone");
        puja2.setLote(3);
        puja2.setTotalLotes(5);
        puja2.setArticuloTitle("Guitarra de Keith Richards");
        puja2.setMiPuja("$1.500.000 ARS");
        puja2.setPujaMaxima("$1.115.000 ARS");
        puja2.setEstado("Ganando");
        
        pujas.add(puja1);
        pujas.add(puja2);
        
        return pujas;
    }

    public List<MiSubastaDTO> obtenerMisSubastas(Integer personaId) {
        List<Producto> productos = productoRepository.findProductosOriginalesPorDuenio(personaId);
        List<MiSubastaDTO> dtos = new ArrayList<>();
        
        for (Producto p : productos) {
            List<ItemCatalogo> items = itemCatalogoRepository.findByProductoIdentificador(p.getIdentificador());
            if (items.isEmpty()) {
                continue;
            }
            ItemCatalogo item = items.get(0);
            if (item.getCatalogo() == null || item.getCatalogo().getSubasta() == null) {
                continue;
            }
            
            MiSubastaDTO dto = new MiSubastaDTO();
            dto.setId(p.getIdentificador());
            dto.setSubastaId(item.getCatalogo().getSubasta().getIdentificador());
            dto.setArticuloTitle(p.getNombre());
            dto.setSubastaTitle(item.getCatalogo().getSubasta().getTitulo());
            dto.setUbicacion(item.getCatalogo().getSubasta().getUbicacion());
            String monedaSubasta = monedaService.monedaSubasta(item.getCatalogo().getSubasta());
            
            List<ItemCatalogo> allItemsInCatalogo = itemCatalogoRepository.findByCatalogoIdentificador(item.getCatalogo().getIdentificador());
            int idx = allItemsInCatalogo.indexOf(item);
            dto.setLote(idx >= 0 ? idx + 1 : 1);
            dto.setTotalLotes(allItemsInCatalogo.size());
            
            Optional<Pujo> pujaLider = pujoRepository.findFirstByItemIdentificadorOrderByImporteDesc(item.getIdentificador());
            if (pujaLider.isPresent()) {
                dto.setPujaMaxima(formatMonto(pujaLider.get().getImporte(), monedaSubasta));
            } else {
                dto.setPujaMaxima(formatMonto(item.getPrecioBase(), monedaSubasta));
            }
            
            List<Foto> fotos = fotoRepository.findByProductoId(p.getIdentificador());
            if (fotos != null && !fotos.isEmpty()) {
                dto.setImage("/api/productos/" + p.getIdentificador() + "/foto");
            }
            
            dtos.add(dto);
        }
        
        return dtos;
    }

    public WonItemDetailDTO obtenerDetalleItemGanado(Integer itemId) {
        ItemCatalogo item = itemCatalogoRepository.findById(itemId)
                .orElseThrow(() -> new java.util.NoSuchElementException("Item de catálogo con ID " + itemId + " no encontrado"));

        List<ItemCatalogo> items = itemCatalogoRepository.findByCatalogoIdentificador(item.getCatalogo().getIdentificador());
        int loteIndex = 1;
        for (int i = 0; i < items.size(); i++) {
            if (items.get(i).getIdentificador().equals(itemId)) {
                loteIndex = i + 1;
                break;
            }
        }
        int totalLotes = items.size();

        BigDecimal importe = BigDecimal.ZERO;
        Optional<Pujo> pujaLider = pujoRepository.findFirstByItemIdentificadorOrderByImporteDesc(itemId);
        if (pujaLider.isPresent()) {
            importe = pujaLider.get().getImporte();
        } else {
            importe = item.getPrecioBase();
        }

        // Obtener el ganador/comprador
        String domicilio = "No especificado";
        if (pujaLider.isPresent()) {
            Cliente cliente = pujaLider.get().getAsistente().getCliente();
            if (cliente.getDireccion() != null && !cliente.getDireccion().isEmpty()) {
                domicilio = cliente.getDireccion();
            }
        }

        String subastaTitle = "Subasta de Colección";
        if (item.getCatalogo().getSubasta() != null && item.getCatalogo().getSubasta().getTitulo() != null) {
            subastaTitle = item.getCatalogo().getSubasta().getTitulo();
        }

        WonItemDetailDTO dto = new WonItemDetailDTO();
        String monedaSubasta = monedaService.monedaSubasta(item.getCatalogo() != null ? item.getCatalogo().getSubasta() : null);
        dto.setItemId(itemId);
        dto.setSubastaTitle(subastaTitle);
        dto.setItemTitle(item.getProducto().getNombre());
        dto.setLoteIndex(loteIndex);
        dto.setTotalLotes(totalLotes);
        dto.setImporte(importe);
        dto.setMoneda(monedaSubasta);
        dto.setDomicilio(domicilio);
        dto.setBloqueadoPorDeuda(false);
        dto.setCostoEnvio(new BigDecimal("20000.00")); // Costo de envío dinámico de 20.000 AR$

        Optional<com.bidowl.auctionplace.entity.RegistroDeSubasta> regOpt = registroDeSubastaRepository.findByProductoIdentificador(item.getProducto().getIdentificador());
        if (regOpt.isPresent()) {
            com.bidowl.auctionplace.entity.RegistroDeSubasta reg = regOpt.get();
            if (reg.getCostoEnvio() != null) {
                dto.setCostoEnvio(reg.getCostoEnvio());
            }
            if (reg.getTipoEntrega() != null) {
                dto.setTipoEntrega(reg.getTipoEntrega());
            }
            clientePenalizacionService.obtenerDeudaPendientePorProducto(item.getProducto().getIdentificador())
                    .ifPresent(deuda -> {
                        dto.setBloqueadoPorDeuda(true);
                        dto.setDeudaEstado(deuda.getEstado());
                        dto.setMontoMulta(deuda.getMontoMulta());
                        dto.setMontoTotalDeuda(deuda.getMontoTotal());
                        dto.setFechaVencimientoDeuda(deuda.getFechaVencimiento().toString());
                    });
        }

        return dto;
    }

    @org.springframework.transaction.annotation.Transactional
    public void registrarConfirmacionEntrega(Integer itemId, String tipoEntrega, BigDecimal costoEnvio, Integer clienteId) throws Exception {
        ItemCatalogo item = itemCatalogoRepository.findById(itemId)
                .orElseThrow(() -> new java.util.NoSuchElementException("Item de catálogo con ID " + itemId + " no encontrado"));
        
        com.bidowl.auctionplace.entity.RegistroDeSubasta registro = registroDeSubastaRepository.findByProductoIdentificador(item.getProducto().getIdentificador())
                .orElseThrow(() -> new Exception("No se encontró el registro de subasta para el producto."));
        
        registro.setTipoEntrega(tipoEntrega);
        registro.setCostoEnvio(costoEnvio);
        registroDeSubastaRepository.save(registro);
        
        // Marcar la notificación como leída
        String accion = "show_bid_won:" + itemId;
        List<Notificacion> notifs = notificacionRepository.findByPersonaIdOrderByFechaDesc(clienteId);
        for (Notificacion n : notifs) {
            if (accion.equals(n.getAccion())) {
                n.setLeida(true);
                notificacionRepository.save(n);
            }
        }
    }

    @org.springframework.transaction.annotation.Transactional
    public com.bidowl.auctionplace.entity.ClienteDeudaSubasta registrarFaltaDePago(Integer itemId, Integer clienteId) throws Exception {
        ItemCatalogo item = itemCatalogoRepository.findById(itemId)
                .orElseThrow(() -> new java.util.NoSuchElementException("Item de catalogo con ID " + itemId + " no encontrado"));

        com.bidowl.auctionplace.entity.RegistroDeSubasta registro = registroDeSubastaRepository.findByProductoIdentificador(item.getProducto().getIdentificador())
                .orElseThrow(() -> new Exception("No se encontro el registro de subasta para el producto."));

        if (!registro.getCliente().getIdentificador().equals(clienteId)) {
            throw new IllegalArgumentException("El item ganado no pertenece al cliente autenticado.");
        }

        com.bidowl.auctionplace.entity.ClienteDeudaSubasta deuda = clientePenalizacionService.generarMultaPorFaltaDePago(registro);

        String accion = "show_bid_won:" + itemId;
        List<Notificacion> notifs = notificacionRepository.findByPersonaIdOrderByFechaDesc(clienteId);
        for (Notificacion n : notifs) {
            if (accion.equals(n.getAccion())) {
                n.setLeida(true);
                notificacionRepository.save(n);
            }
        }
        return deuda;
    }

    public com.bidowl.auctionplace.entity.ClienteDeudaSubasta regularizarDeuda(Integer deudaId, Integer clienteId) {
        return clientePenalizacionService.regularizarDeuda(deudaId, clienteId);
    }

    public List<HistorialPujaUsuarioDTO> obtenerHistorial(Integer personaId) {
        List<Pujo> pujas = pujoRepository.findByAsistenteClienteIdentificador(personaId);
        List<HistorialPujaUsuarioDTO> dtos = new ArrayList<>();
        
        // Sort bids by date/time descending so that the most recent bids appear first
        pujas.sort((a, b) -> {
            if (a.getFechaHora() == null && b.getFechaHora() == null) return 0;
            if (a.getFechaHora() == null) return 1;
            if (b.getFechaHora() == null) return -1;
            return b.getFechaHora().compareTo(a.getFechaHora());
        });

        for (Pujo p : pujas) {
            ItemCatalogo item = p.getItem();
            if (item == null || item.getCatalogo() == null || item.getCatalogo().getSubasta() == null) {
                continue;
            }
            
            HistorialPujaUsuarioDTO dto = new HistorialPujaUsuarioDTO();
            dto.setId(p.getIdentificador());
            dto.setSubastaId(item.getCatalogo().getSubasta().getIdentificador());
            dto.setSubastaTitle(item.getCatalogo().getSubasta().getTitulo());
            dto.setArticuloTitle(item.getProducto() != null ? item.getProducto().getNombre() : "Artículo " + item.getIdentificador());
            dto.setImage(item.getProducto() != null ? "/api/productos/" + item.getProducto().getIdentificador() + "/foto" : null);
            dto.setMonto(formatMonto(p.getImporte(), monedaService.monedaSubasta(item.getCatalogo().getSubasta())));
            dto.setGanador("si".equalsIgnoreCase(p.getGanador()));
            
            List<ItemCatalogo> allItemsInCatalogo = itemCatalogoRepository.findByCatalogoIdentificador(item.getCatalogo().getIdentificador());
            int idx = allItemsInCatalogo.indexOf(item);
            dto.setLote(idx >= 0 ? idx + 1 : 1);
            dto.setTotalLotes(allItemsInCatalogo.size());
            
            dtos.add(dto);
        }
        return dtos;
    }

    private String formatMonto(BigDecimal monto, String moneda) {
        String monedaNormalizada = monedaService.normalizar(moneda);
        Locale locale = MonedaService.DOLARES.equals(monedaNormalizada) ? Locale.US : new Locale("es", "AR");
        java.util.Currency currency = java.util.Currency.getInstance(MonedaService.DOLARES.equals(monedaNormalizada) ? "USD" : "ARS");
        NumberFormat format = NumberFormat.getCurrencyInstance(locale);
        format.setCurrency(currency);
        return format.format(monto != null ? monto : BigDecimal.ZERO);
    }
}
