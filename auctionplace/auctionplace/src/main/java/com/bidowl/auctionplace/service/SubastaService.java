package com.bidowl.auctionplace.service;

import com.bidowl.auctionplace.dto.*;
import com.bidowl.auctionplace.entity.*;
import com.bidowl.auctionplace.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SubastaService {

    @Autowired
    private SubastaRepository subastaRepository;

    @Autowired
    private ItemCatalogoService itemCatalogoService;

    @Autowired
    private ItemCatalogoRepository itemCatalogoRepository;

    @Autowired
    private AsistenteRepository asistenteRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private PujoRepository pujoRepository;

    @Autowired
    private PaisRepository paisRepository;

    @Autowired
    private CatalogoRepository catalogoRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private PropuestaComercialRepository propuestaComercialRepository;

    @Autowired
    private SubastadorRepository subastadorRepository;

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Autowired
    private MetodoPagoRepository metodoPagoRepository;

    public List<Subasta> obtenerTodas() {
        return subastaRepository.findAll();
    }

    public List<Subasta> obtenerPorEstado(String estado) {
        return subastaRepository.findByEstado(estado);
    }

    public Subasta obtenerPorId(Integer id) {
        return subastaRepository.findById(id)
                .orElseThrow(() -> new java.util.NoSuchElementException("Subasta no encontrada con el identificador: " + id));
    }

    public List<ItemCatalogo> obtenerCatalogo(Integer subastaId) {
        return itemCatalogoRepository.findByCatalogoSubastaIdentificador(subastaId);
    }

    public Asistente unirseASubasta(Integer clienteId, Integer subastaId) {
        Subasta subasta = obtenerPorId(subastaId);
        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new java.util.NoSuchElementException("Cliente no encontrado con el identificador: " + clienteId));

        // 1. Validar categoría
        if (getCategoryRank(cliente.getCategoriaCliente()) < getCategoryRank(subasta.getCategoria())) {
            throw new IllegalArgumentException("Tu categoría (" + cliente.getCategoriaCliente() +
                                ") es inferior a la categoría requerida para esta subasta (" + subasta.getCategoria() + ").");
        }

        // 2. Si ya es asistente, retornar existente (la lógica de creación se centraliza)
        Optional<Asistente> existente = asistenteRepository.findByClienteIdentificadorAndSubastaIdentificador(clienteId, subastaId);
        if (existente.isPresent()) {
            return existente.get();
        }

        // 3. Crear asistente
        Asistente nuevoAsistente = new Asistente();
        nuevoAsistente.setCliente(cliente);
        nuevoAsistente.setSubasta(subasta);
        // Generar número de postor secuencial/aleatorio para la demo
        int numeroPostor = (int) (Math.random() * 9000) + 1000;
        nuevoAsistente.setNumeroPostor(numeroPostor);

        // Actualizar estadísticas de la persona
        cliente.setRematesAsistidos(cliente.getRematesAsistidos() + 1);
        clienteRepository.save(cliente);

        return asistenteRepository.save(nuevoAsistente);
    }

    private int getCategoryRank(String cat) {
        if (cat == null) return 0;
        switch (cat.toLowerCase()) {
            case "comun": return 1;
            case "especial": return 2;
            case "plata": return 3;
            case "oro": return 4;
            case "platino": return 5;
            default: return 0;
        }
    }

    /**
     * GET - Obtener estado actual de un item en subasta
     * GET /api/subastas/{idSubasta}/items/{iditem}
     */
    public EstadoItemSubastaDTO obtenerEstadoItem(Integer idSubasta, Integer iditem) {
        // Validar que el item existe y pertenece a la subasta en una sola consulta
        ItemCatalogo itemCatalogo = itemCatalogoRepository.findByIdentificadorAndCatalogo_Subasta_Identificador(iditem, idSubasta)
                .orElseThrow(() -> new java.util.NoSuchElementException("Item con ID " + iditem + " no encontrado en la subasta " + idSubasta));
        
        // Obtener la puja líder (mayor monto)
        Optional<Pujo> pujaLider = pujoRepository.findFirstByItemIdentificadorOrderByImporteDesc(iditem);

        EstadoItemSubastaDTO estado = new EstadoItemSubastaDTO();
        estado.setIditem(iditem.toString());

        if (pujaLider.isPresent()) {
            Pujo puja = pujaLider.get();
            PujaLiderDTO lider = new PujaLiderDTO();
            lider.setIdpersona(puja.getAsistente().getCliente().getIdentificador().toString());
            lider.setNombre(puja.getAsistente().getCliente().getNombre());
            lider.setMonto(puja.getImporte());
            estado.setPujaLider(lider);
        }

        // Lógica de temporizador de 1 minuto y auto-cierre
        if (itemCatalogo.getFechaFinPuja() != null) {
            boolean expiro = LocalDateTime.now().isAfter(itemCatalogo.getFechaFinPuja());
            if (expiro && !"si".equalsIgnoreCase(itemCatalogo.getSubastado())) {
                try {
                    itemCatalogoService.finalizarSubastaDeItem(iditem);
                } catch (Exception e) {
                    itemCatalogo.setSubastado("si");
                    itemCatalogoRepository.save(itemCatalogo);
                    if (pujaLider.isPresent()) {
                        Pujo puja = pujaLider.get();
                        puja.setGanador("si");
                        pujoRepository.save(puja);
                    }
                }
            }
            long segundos = Duration.between(LocalDateTime.now(), itemCatalogo.getFechaFinPuja()).getSeconds();
            if (segundos < 0) segundos = 0L;
            estado.setSegundosRestantes(segundos);
            estado.setFinalizado(expiro || "si".equalsIgnoreCase(itemCatalogo.getSubastado()));
        } else {
            estado.setSegundosRestantes(null);
            estado.setFinalizado("si".equalsIgnoreCase(itemCatalogo.getSubastado()));
        }

        return estado;
    }

    /**
     * GET - Obtener historial de pujas de un item
     * GET /api/subastas/{idSubasta}/items/{iditem}/pujas
     */
    public List<HistorialPujaDTO> obtenerHistorialPujas(Integer idSubasta, Integer iditem) {
        // Validar que el item pertenece a la subasta
        if (!itemCatalogoRepository.existsByIdentificadorAndCatalogo_Subasta_Identificador(iditem, idSubasta)) {
             throw new java.util.NoSuchElementException("Item con ID " + iditem + " no encontrado en la subasta " + idSubasta);
        }
        // Obtener todas las pujas ordenadas por monto descendente
        List<Pujo> pujas = pujoRepository.findPujasByItem(iditem);

        return pujas.stream()
                .map(puja -> {
                    HistorialPujaDTO dto = new HistorialPujaDTO();
                    dto.setIdpersona(puja.getAsistente().getCliente().getIdentificador().toString());
                    dto.setNombre(puja.getAsistente().getCliente().getNombre());
                    dto.setMonto(puja.getImporte());
                    
                    LocalDateTime fechaHora = puja.getFechaHora();
                    if (fechaHora == null) {
                        dto.setHace("N/A");
                    } else {
                        LocalDateTime now = LocalDateTime.now();
                        Duration duration = Duration.between(fechaHora, now);
                        long seconds = duration.getSeconds();
                        if (seconds < 0) {
                            dto.setHace("hace unos segundos");
                        } else if (seconds < 60) {
                            dto.setHace("hace " + seconds + (seconds == 1 ? " segundo" : " segundos"));
                        } else {
                            long minutes = duration.toMinutes();
                            if (minutes < 60) {
                                dto.setHace("hace " + minutes + (minutes == 1 ? " minuto" : " minutos"));
                            } else {
                                long hours = duration.toHours();
                                if (hours < 24) {
                                    dto.setHace("hace " + hours + (hours == 1 ? " hora" : " horas"));
                                } else {
                                    long days = duration.toDays();
                                    if (days < 30) {
                                        dto.setHace("hace " + days + (days == 1 ? " día" : " días"));
                                    } else {
                                        long months = days / 30;
                                        dto.setHace("hace " + months + (months == 1 ? " mes" : " meses"));
                                    }
                                }
                            }
                        }
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    /**
     * GET - Obtener límites de puja (1% y 20%)
     * GET /api/subastas/{idSubasta}/items/{iditem}/limites-puja
     */
    public LimitesPujaDTO obtenerLimitesPuja(Integer idSubasta, Integer iditem) {
        // Validar que el item existe y pertenece a la subasta
        ItemCatalogo itemCatalogo = itemCatalogoRepository.findByIdentificadorAndCatalogo_Subasta_Identificador(iditem, idSubasta)
                .orElseThrow(() -> new java.util.NoSuchElementException("Item con ID " + iditem + " no encontrado en la subasta " + idSubasta));
        
        // Calcular límites basados en el precio base
        BigDecimal precioBase = itemCatalogo.getPrecioBase();
        String categoria = itemCatalogo.getCatalogo().getSubasta().getCategoria();
        boolean esCategoriaAlta = "oro".equalsIgnoreCase(categoria) || "platino".equalsIgnoreCase(categoria);

        BigDecimal pujaMinima;
        BigDecimal pujaMaxima;

        // Si hay puja líder, usar eso como referencia
        Optional<Pujo> pujaLider = pujoRepository.findFirstByItemIdentificadorOrderByImporteDesc(iditem);
        if (pujaLider.isPresent()) {
            BigDecimal montoUltima = pujaLider.get().getImporte();
            if (esCategoriaAlta) {
                pujaMinima = montoUltima.add(BigDecimal.valueOf(0.01)); // Solo debe superar la última puja
                pujaMaxima = null; // Sin límite
            } else {
                BigDecimal incrementoMinimo = precioBase.multiply(BigDecimal.valueOf(0.01));
                BigDecimal incrementoMaximo = precioBase.multiply(BigDecimal.valueOf(0.20));
                pujaMinima = montoUltima.add(incrementoMinimo);
                pujaMaxima = montoUltima.add(incrementoMaximo);
            }
        } else {
            // Primera puja
            pujaMinima = precioBase;
            if (esCategoriaAlta) {
                pujaMaxima = null;
            } else {
                pujaMaxima = precioBase.add(precioBase.multiply(BigDecimal.valueOf(0.20)));
            }
        }

        LimitesPujaDTO limites = new LimitesPujaDTO();
        limites.setPujaMinima(pujaMinima);
        limites.setPujaMaxima(pujaMaxima);

        return limites;
    }

    /**
     * POST - Crear nueva puja
     * POST /api/subastas/{idSubasta}/items/{iditem}/pujas
     */
    public CrearPujaResponse crearPuja(Integer idSubasta, Integer iditem, BigDecimal monto, 
                                       String idMetodoPago, Integer clienteId) {
        
        // Validar que el item existe y pertenece a la subasta
        ItemCatalogo itemCatalogo = itemCatalogoRepository.findByIdentificadorAndCatalogo_Subasta_Identificador(iditem, idSubasta)
                .orElseThrow(() -> new java.util.NoSuchElementException("Item con ID " + iditem + " no encontrado en la subasta " + idSubasta));

        if (itemCatalogo.getProducto().getDuenio().getIdentificador().equals(clienteId)) {
            throw new IllegalArgumentException("No puedes pujar por un artículo de tu propiedad.");
        }

        // Validar secuencialidad de los lotes: el lote anterior debe haber finalizado
        List<ItemCatalogo> todosLosItems = itemCatalogoRepository.findByCatalogoSubastaIdentificador(idSubasta);
        todosLosItems.sort(java.util.Comparator.comparing(ItemCatalogo::getIdentificador));
        for (ItemCatalogo item : todosLosItems) {
            if (item.getIdentificador().equals(iditem)) {
                break;
            }
            if (!"si".equalsIgnoreCase(item.getSubastado())) {
                throw new IllegalStateException("No se puede pujar sobre este lote porque el lote anterior (Lote " + item.getIdentificador() + ") aún no ha finalizado.");
            }
        }

        // Lógica de temporizador de lote
        if (itemCatalogo.getFechaFinPuja() != null && LocalDateTime.now().isAfter(itemCatalogo.getFechaFinPuja())) {
            itemCatalogo.setSubastado("si");
            itemCatalogoRepository.save(itemCatalogo);
            Optional<Pujo> pujaLider = pujoRepository.findFirstByItemIdentificadorOrderByImporteDesc(iditem);
            if (pujaLider.isPresent()) {
                Pujo lider = pujaLider.get();
                lider.setGanador("si");
                pujoRepository.save(lider);
            }
            throw new IllegalStateException("El remate de este artículo ha finalizado.");
        }
        if ("si".equalsIgnoreCase(itemCatalogo.getSubastado())) {
            throw new IllegalStateException("El remate de este artículo ha finalizado.");
        }

        // Validar que la subasta existe y está abierta
        Optional<Subasta> subasta = subastaRepository.findById(idSubasta);
        if (subasta.isEmpty() || !"abierta".equalsIgnoreCase(subasta.get().getEstado())) {
            throw new IllegalStateException("La subasta no existe o no está abierta");
        }

        // Validar que el cheque certificado tenga monto suficiente para cubrir la puja
        if (idMetodoPago != null && !idMetodoPago.isEmpty()) {
            try {
                Integer mpId = Integer.parseInt(idMetodoPago);
                Optional<MetodoPago> mpOpt = metodoPagoRepository.findById(mpId);
                if (mpOpt.isPresent()) {
                    MetodoPago mp = mpOpt.get();
                    if (mp.getChequeCertificado() != null) {
                        BigDecimal chequeMonto = mp.getChequeCertificado().getMonto();
                        if (chequeMonto != null && chequeMonto.compareTo(monto) < 0) {
                            throw new IllegalArgumentException("El monto del cheque certificado ($" + chequeMonto + ") es insuficiente para cubrir la puja de $" + monto);
                        }
                    }
                }
            } catch (NumberFormatException e) {
                // Ignorar para IDs de prueba de la demo
            }
        }

        // Validar montos contra límites
        LimitesPujaDTO limites = obtenerLimitesPuja(idSubasta, iditem);
        if (limites.getPujaMinima() != null && monto.compareTo(limites.getPujaMinima()) < 0) {
            throw new IllegalArgumentException("La puja es menor al mínimo permitido: " + limites.getPujaMinima());
        }
        if (limites.getPujaMaxima() != null && monto.compareTo(limites.getPujaMaxima()) > 0) {
            throw new IllegalArgumentException("La puja excede el máximo permitido: " + limites.getPujaMaxima());
        }

        // Obtener o crear asistente (lógica centralizada y corregida)
        Asistente asistente = getOrCreateAsistente(clienteId, idSubasta);

        // Iniciar o reiniciar el temporizador de 1 minuto
        itemCatalogo.setFechaFinPuja(LocalDateTime.now().plusMinutes(1));
        itemCatalogoRepository.save(itemCatalogo);

        // Crear la puja
        Pujo puja = new Pujo();
        puja.setAsistente(asistente);
        puja.setItem(itemCatalogo);
        puja.setImporte(monto);
        puja.setGanador("no");
        puja.setFechaHora(LocalDateTime.now());

        Pujo pujaSaved = pujoRepository.save(puja);

        CrearPujaResponse respuesta = new CrearPujaResponse();
        respuesta.setExito(true);
        respuesta.setPujaActual(monto);
        respuesta.setMensaje("Puja registrada exitosamente");

        return respuesta;
    }

    /**
     * GET - Obtener catálogo público de subastas con filtros y paginación
     * GET /api/subastas?estado=activa&categoria=oro&pagina=1&limite=10
     */
    public List<SubastaPublicaDTO> obtenerCatalogoPublico(String estado, String categoria, int pagina, int limite) {
        Pageable pageable = PageRequest.of(pagina - 1, limite);
        // REESTRUCTURADO: Esta llamada ahora es altamente eficiente.
        // Utiliza la consulta JPQL personalizada en SubastaRepository para evitar el problema N+1.
        return subastaRepository.findCatalogoPublico(estado, categoria, pageable).getContent();
    }

    /**
     * GET - Obtener detalle completo de una subasta
     * GET /api/subastas/{idSubasta}
     */
    public SubastaDetalleDTO obtenerDetalleSubasta(Integer idSubasta) {
        Optional<Subasta> subasta = subastaRepository.findById(idSubasta);
        if (subasta.isEmpty()) {
            throw new java.util.NoSuchElementException("Subasta no encontrada");
        }

        Subasta s = subasta.get();
        SubastaDetalleDTO dto = new SubastaDetalleDTO();
        dto.setId(s.getIdentificador().toString());
        dto.setTitulo(s.getTitulo() != null ? s.getTitulo() : "Subasta " + s.getIdentificador());
        dto.setDescripcion(s.getDescripcion());
        dto.setImagenPortada("/api/subastas/" + s.getIdentificador() + "/foto");
        String nombreRematador = "Rematador Desconocido";
        if (s.getSubastador() != null) {
            String nom = s.getSubastador().getNombre() != null ? s.getSubastador().getNombre() : "";
            String ape = s.getSubastador().getApellido() != null ? s.getSubastador().getApellido() : "";
            nombreRematador = (nom + " " + ape).trim();
            if (nombreRematador.isEmpty()) {
                nombreRematador = "Rematador Desconocido";
            }
        }
        dto.setRematador(nombreRematador);
        dto.setUbicacion(s.getUbicacion() != null ? s.getUbicacion() : "Por definir");
        dto.setDireccionDetallada(s.getDireccionDetallada() != null ? s.getDireccionDetallada() : "Ubicado en la dirección indicada por la organización de remates.");
        dto.setFecha(s.getFecha() != null ? s.getFecha().toString() : "");
        dto.setHora(s.getHora() != null ? s.getHora().toString() : "");
        dto.setCategoria(s.getCategoria());

        // Obtener items
        List<ItemCatalogo> items = itemCatalogoRepository.findByCatalogoSubastaIdentificador(idSubasta);
        dto.setCantidadTotalitems(items.size());

        // Crear previsualizaciones (primeros 5 items)
        List<ItemPreviewDTO> previsualizacion = items.stream()
                .limit(5)
                .map(item -> {
                    ItemPreviewDTO preview = new ItemPreviewDTO();
                    preview.setIditem(item.getIdentificador().toString());
                    String nombreProducto = "Item " + item.getIdentificador();
                    if (item.getProducto() != null) {
                        if (item.getProducto().getNombre() != null && !item.getProducto().getNombre().isEmpty()) {
                            nombreProducto = item.getProducto().getNombre();
                        } else if (item.getProducto().getDescripcionCatalogo() != null && !item.getProducto().getDescripcionCatalogo().isEmpty()) {
                            nombreProducto = item.getProducto().getDescripcionCatalogo();
                        }
                    }
                    preview.setNombre(nombreProducto);
                    preview.setValorBase(item.getPrecioBase());
                    
                    String imagen = "https://via.placeholder.com/200x150?text=" + nombreProducto;
                    if (item.getProducto() != null) {
                        imagen = "/api/productos/" + item.getProducto().getIdentificador() + "/foto";
                    }
                    preview.setImagen(imagen);

                    String duenioNombre = "Dueño Desconocido";
                    String desc = "";
                    if (item.getProducto() != null) {
                        if (item.getProducto().getDuenio() != null) {
                            String nom = item.getProducto().getDuenio().getNombre() != null ? item.getProducto().getDuenio().getNombre() : "";
                            String ape = item.getProducto().getDuenio().getApellido() != null ? item.getProducto().getDuenio().getApellido() : "";
                            duenioNombre = (nom + " " + ape).trim();
                        }
                        desc = item.getProducto().getDescripcion() != null ? item.getProducto().getDescripcion() : item.getProducto().getDescripcionCatalogo();
                    }
                    preview.setDuenioNombre(duenioNombre);
                    preview.setDescripcion(desc);

                    return preview;
                })
                .collect(Collectors.toList());

        dto.setPrevisualizacionitems(previsualizacion);

        return dto;
    }

    /**
     * GET - Obtener catálogo completo de items de una subasta
     * GET /api/subastas/{idSubasta}/catalogo
     */
    public List<ItemCatalogoDTO> obtenerCatalogoItemsSubasta(Integer idSubasta) {
        Optional<Subasta> subasta = subastaRepository.findById(idSubasta);
        if (subasta.isEmpty()) {
            throw new java.util.NoSuchElementException("Subasta no encontrada");
        }

        List<ItemCatalogo> items = itemCatalogoRepository.findByCatalogoSubastaIdentificador(idSubasta);

        return items.stream()
                .map(item -> {
                    ItemCatalogoDTO dto = new ItemCatalogoDTO();
                    dto.setIditem(item.getIdentificador().toString());
                    String nombreProducto = "Item " + item.getIdentificador();
                    if (item.getProducto() != null) {
                        if (item.getProducto().getNombre() != null && !item.getProducto().getNombre().isEmpty()) {
                            nombreProducto = item.getProducto().getNombre();
                        } else if (item.getProducto().getDescripcionCatalogo() != null && !item.getProducto().getDescripcionCatalogo().isEmpty()) {
                            nombreProducto = item.getProducto().getDescripcionCatalogo();
                        }
                    }
                    dto.setNombre(nombreProducto);
                    dto.setValorBase(item.getPrecioBase());
                    
                    String imagen = "https://via.placeholder.com/200x150?text=" + nombreProducto;
                    if (item.getProducto() != null) {
                        imagen = "/api/productos/" + item.getProducto().getIdentificador() + "/foto";
                    }
                    dto.setImagen(imagen);

                    String duenioNombre = "Dueño Desconocido";
                    String desc = "";
                    if (item.getProducto() != null) {
                        if (item.getProducto().getDuenio() != null) {
                            String nom = item.getProducto().getDuenio().getNombre() != null ? item.getProducto().getDuenio().getNombre() : "";
                            String ape = item.getProducto().getDuenio().getApellido() != null ? item.getProducto().getDuenio().getApellido() : "";
                            duenioNombre = (nom + " " + ape).trim();
                        }
                        desc = item.getProducto().getDescripcion() != null ? item.getProducto().getDescripcion() : item.getProducto().getDescripcionCatalogo();
                    }
                    dto.setDuenioNombre(duenioNombre);
                    dto.setDescripcion(desc);
                    dto.setSubastado(item.getSubastado());

                    return dto;
                })
                .collect(Collectors.toList());
    }

    public byte[] obtenerFotoSubastaBytes(Integer subastaId) {
        Optional<Subasta> subasta = subastaRepository.findById(subastaId);
        return subasta.map(Subasta::getFoto).orElse(null);
    }

    /**
     * GET - Verificar elegibilidad para unirse a una subasta
     * GET /api/subastas/{idSubasta}/elegibilidad
     */
    public ElegibilidadDTO verificarElegibilidad(Integer clienteId, Integer idSubasta) {
        ElegibilidadDTO resultado = new ElegibilidadDTO();

        // Validar que la subasta existe
        Optional<Subasta> subasta = subastaRepository.findById(idSubasta);
        if (subasta.isEmpty()) {
            throw new java.util.NoSuchElementException("Subasta no encontrada");
        }

        // Validar que el cliente existe
        Optional<Cliente> cliente = clienteRepository.findById(clienteId);
        if (cliente.isEmpty()) {
            throw new java.util.NoSuchElementException("Cliente no encontrado");
        }

        // Verificar si ya está unido
        Optional<Asistente> asistenteExistente = asistenteRepository.findByClienteIdentificadorAndSubastaIdentificador(clienteId, idSubasta);
        resultado.setYaUnido(asistenteExistente.isPresent());

        String categoriaRequerida = subasta.get().getCategoria();
        String categoriaCliente = cliente.get().getCategoriaCliente();

        // Validar categoría
        if (getCategoryRank(categoriaCliente) < getCategoryRank(categoriaRequerida)) {
            resultado.setPuedeUnirse(false);
            resultado.setMotivoRechazo("Tu categoría (" + categoriaCliente + 
                                      ") es inferior a la requerida (" + categoriaRequerida + ")");
            return resultado;
        }


        resultado.setPuedeUnirse(true);
        resultado.setMotivoRechazo(null);
        return resultado;
    }

    /**
     * POST - Unirse a subasta y obtener acceso a streaming
     * POST /api/subastas/{idSubasta}/unirse
     */
    public UnirseResponse unirseAlStreaming(Integer clienteId, Integer idSubasta) {
        // Verificar elegibilidad primero
        ElegibilidadDTO elegibilidad = verificarElegibilidad(clienteId, idSubasta);
        if (!elegibilidad.getPuedeUnirse()) {
            throw new IllegalArgumentException(elegibilidad.getMotivoRechazo());
        }

        // Crear/obtener asistente usando el método centralizado
        getOrCreateAsistente(clienteId, idSubasta);

        // Generar tokens para streaming y websocket
        String tokenWebsocket = UUID.randomUUID().toString();
        String urlStreaming = "wss://streaming.bidowl.com/subastas/" + idSubasta + 
                             "/items?token=" + tokenWebsocket;

        UnirseResponse respuesta = new UnirseResponse();
        respuesta.setUrlStreaming(urlStreaming);
        respuesta.setTokenWebsocket(tokenWebsocket);

        return respuesta;
    }

    /**
     * Método privado para obtener o crear un Asistente.
     * Centraliza la lógica, mejora la eficiencia y evita duplicación.
     */
    private Asistente getOrCreateAsistente(Integer clienteId, Integer subastaId) {
        return asistenteRepository.findByClienteIdentificadorAndSubastaIdentificador(clienteId, subastaId)
                .orElseGet(() -> {
                    Subasta subasta = subastaRepository.findById(subastaId)
                            .orElseThrow(() -> new java.util.NoSuchElementException("Subasta no encontrada: " + subastaId));

                    Cliente cliente = clienteRepository.findById(clienteId)
                            .orElseThrow(() -> new java.util.NoSuchElementException("Cliente no encontrado: " + clienteId));

                    // Validaciones de elegibilidad (se podrían mover aquí también si se desea)
                    if (getCategoryRank(cliente.getCategoriaCliente()) < getCategoryRank(subasta.getCategoria())) {
                        throw new IllegalArgumentException("Categoría de cliente insuficiente.");
                    }

                    Asistente nuevoAsistente = new Asistente();
                    nuevoAsistente.setCliente(cliente);
                    nuevoAsistente.setSubasta(subasta);
                    nuevoAsistente.setNumeroPostor((int) (Math.random() * 10000));
                    
                    cliente.setRematesAsistidos(cliente.getRematesAsistidos() + 1);
                    clienteRepository.save(cliente);

                    return asistenteRepository.save(nuevoAsistente);
                });
    }
    public CrearPujaResponse simularPuja(Integer idSubasta, Integer iditem) {
        return simularPuja(idSubasta, iditem, null, null);
    }

    public CrearPujaResponse simularPuja(Integer idSubasta, Integer iditem, Integer clienteId, BigDecimal montoPersonalizado) {
        // 1. Determinar el monto
        BigDecimal monto = montoPersonalizado;
        if (monto == null) {
            LimitesPujaDTO limites = obtenerLimitesPuja(idSubasta, iditem);
            if (limites.getPujaMinima() != null) {
                monto = limites.getPujaMinima();
                Optional<Pujo> pujaLider = pujoRepository.findFirstByItemIdentificadorOrderByImporteDesc(iditem);
                if (pujaLider.isPresent()) {
                    BigDecimal incremento = BigDecimal.valueOf((int)(Math.random() * 40000) + 10000);
                    monto = monto.add(incremento);
                }
            } else {
                monto = BigDecimal.valueOf(100000);
            }

            if (limites.getPujaMaxima() != null && monto.compareTo(limites.getPujaMaxima()) > 0) {
                monto = limites.getPujaMaxima();
            }
        }

        // 2. Determinar el cliente
        Cliente cliente;
        if (clienteId != null) {
            cliente = clienteRepository.findById(clienteId)
                    .orElseThrow(() -> new java.util.NoSuchElementException("Cliente no encontrado con id: " + clienteId));
        } else {
            String[] nombresMock = {
                "Diego Maradona", "Lionel Messi", "Sofia Rodriguez", 
                "Gaston Vocos", "Micaela Perez", "Carlos Tevez", 
                "Juan Roman Riquelme", "Emanuel Ginobili"
            };
            int randIndex = (int) (Math.random() * nombresMock.length);
            String fullName = nombresMock[randIndex];
            String[] nameParts = fullName.split(" ");
            String nombre = nameParts[0];
            String apellido = nameParts[1];
            String email = nombre.toLowerCase() + "." + apellido.toLowerCase() + "@mockbidding.com";

            Pais paisDefault = paisRepository.findAll().stream().findFirst().orElse(null);

            cliente = clienteRepository.findByEmail(email).orElseGet(() -> {
                Cliente nuevo = new Cliente();
                nuevo.setNombre(nombre);
                nuevo.setApellido(apellido);
                nuevo.setEmail(email);
                nuevo.setDocumento(String.valueOf((int)(Math.random() * 90000000) + 10000000));
                nuevo.setContrasena("dummy123");
                nuevo.setEstado("activo");
                nuevo.setCategoria("platino");
                nuevo.setAdmitido("si");
                nuevo.setPais(paisDefault);
                nuevo.setPaisCliente(paisDefault);
                nuevo.setRematesAsistidos(1);
                return clienteRepository.save(nuevo);
            });
        }

        // 3. Crear puja usando el flujo estándar
        return crearPuja(idSubasta, iditem, monto, "1", cliente.getIdentificador());
    }

    @Transactional
    public Subasta crearSubastaConCatalogo(SubastaCrearRequest request) throws Exception {
        // 1. Validar fecha (debe ser al menos 10 días posterior a hoy)
        java.time.LocalDate dateFecha;
        try {
            dateFecha = java.time.LocalDate.parse(request.getFecha());
        } catch (Exception e) {
            throw new IllegalArgumentException("Formato de fecha inválido. Debe ser yyyy-MM-dd.");
        }

        if (dateFecha.isBefore(java.time.LocalDate.now().plusDays(10))) {
            throw new IllegalArgumentException("La fecha de la subasta debe ser al menos 10 días posterior a la fecha actual.");
        }

        // Parsear hora
        java.time.LocalTime timeHora;
        try {
            String horaStr = request.getHora();
            if (horaStr.length() == 5) { // HH:mm
                timeHora = java.time.LocalTime.parse(horaStr + ":00");
            } else {
                timeHora = java.time.LocalTime.parse(horaStr);
            }
        } catch (Exception e) {
            throw new IllegalArgumentException("Formato de hora inválido. Debe ser HH:mm:ss o HH:mm.");
        }

        // 2. Buscar y validar Subastador
        Subastador subastador = null;
        if (request.getSubastadorId() != null) {
            subastador = subastadorRepository.findById(request.getSubastadorId())
                    .orElseThrow(() -> new java.util.NoSuchElementException("Subastador no encontrado con ID: " + request.getSubastadorId()));
        }

        // 3. Buscar y validar Empleado Responsable
        Empleado responsable = null;
        if (request.getResponsableId() != null) {
            responsable = empleadoRepository.findById(request.getResponsableId())
                    .orElseThrow(() -> new java.util.NoSuchElementException("Empleado responsable no encontrado con ID: " + request.getResponsableId()));
        } else {
            // Empleado por defecto
            responsable = empleadoRepository.findById(1)
                    .orElseThrow(() -> new java.util.NoSuchElementException("No hay empleados disponibles por defecto."));
        }

        // 4. Crear y guardar Subasta
        Subasta subasta = new Subasta();
        subasta.setFecha(dateFecha);
        subasta.setHora(timeHora);
        subasta.setEstado("cerrada"); // Default cerrado
        subasta.setSubastador(subastador);
        subasta.setUbicacion(request.getUbicacion());
        subasta.setCapacidadAsistentes(request.getCapacidadAsistentes());
        subasta.setTieneDeposito(request.getTieneDeposito() != null ? request.getTieneDeposito() : "no");
        subasta.setSeguridadPropia(request.getSeguridadPropia() != null ? request.getSeguridadPropia() : "no");
        subasta.setCategoria(request.getCategoria() != null ? request.getCategoria() : "comun");
        subasta.setTitulo(request.getTitulo() != null ? request.getTitulo() : "Subasta");
        subasta.setDescripcion(request.getDescripcion());
        subasta.setDireccionDetallada(request.getDireccionDetallada());

        Subasta subastaGuardada = subastaRepository.save(subasta);

        // 5. Crear y guardar Catalogo
        Catalogo catalogo = new Catalogo();
        catalogo.setDescripcion(request.getCatalogoDescripcion() != null ? request.getCatalogoDescripcion() : "Catálogo");
        catalogo.setSubasta(subastaGuardada);
        catalogo.setResponsable(responsable);

        Catalogo catalogoGuardado = catalogoRepository.save(catalogo);

        // 6. Procesar items del catálogo
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (ItemCatalogoCrearRequest itemReq : request.getItems()) {
                Producto producto = productoRepository.findById(itemReq.getProductoId())
                        .orElseThrow(() -> new java.util.NoSuchElementException("Producto no encontrado con ID: " + itemReq.getProductoId()));

                if (!"si".equalsIgnoreCase(producto.getDisponible())) {
                    throw new IllegalStateException("El producto con ID " + itemReq.getProductoId() + " no está disponible.");
                }

                // Obtener propuesta comercial para fallback de precioBase y comision
                PropuestaComercial propuesta = propuestaComercialRepository.findByProducto(producto)
                        .orElse(null);

                BigDecimal precioBase = itemReq.getPrecioBase();
                if (precioBase == null) {
                    if (propuesta != null) {
                        precioBase = propuesta.getValorBase();
                    } else {
                        throw new IllegalArgumentException("Debe especificar el precio base o tener una propuesta comercial registrada para el producto ID: " + itemReq.getProductoId());
                    }
                }

                BigDecimal comision = itemReq.getComision();
                if (comision == null) {
                    if (propuesta != null) {
                        comision = propuesta.getComision();
                    } else {
                        throw new IllegalArgumentException("Debe especificar la comisión o tener una propuesta comercial registrada para el producto ID: " + itemReq.getProductoId());
                    }
                }

                java.time.LocalDateTime fechaFinPuja = null;
                if (itemReq.getFechaFinPuja() != null && !itemReq.getFechaFinPuja().isEmpty()) {
                    try {
                        fechaFinPuja = java.time.LocalDateTime.parse(itemReq.getFechaFinPuja().replace(" ", "T"));
                    } catch (Exception e) {
                        throw new IllegalArgumentException("Formato de fecha de fin de puja inválido. Debe ser yyyy-MM-dd HH:mm:ss.");
                    }
                } else {
                    // Por defecto, fin de puja es a la hora de inicio de la subasta más 1 hora
                    fechaFinPuja = java.time.LocalDateTime.of(dateFecha, timeHora).plusHours(1);
                }

                ItemCatalogo item = new ItemCatalogo();
                item.setCatalogo(catalogoGuardado);
                item.setProducto(producto);
                item.setPrecioBase(precioBase);
                item.setComision(comision);
                item.setSubastado("no");
                item.setFechaFinPuja(fechaFinPuja);

                itemCatalogoRepository.save(item);
            }
        }

        return subastaGuardada;
    }
}

