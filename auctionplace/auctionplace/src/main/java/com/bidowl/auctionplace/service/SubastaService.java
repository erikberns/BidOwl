package com.bidowl.auctionplace.service;

import com.bidowl.auctionplace.dto.*;
import com.bidowl.auctionplace.entity.*;
// Asumimos que estas excepciones personalizadas existen en un paquete 'exception'
// import com.bidowl.auctionplace.exception.BusinessLogicException;
// import com.bidowl.auctionplace.exception.ResourceNotFoundException;
import com.bidowl.auctionplace.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SubastaService {

    @Autowired
    private SubastaRepository subastaRepository;

    @Autowired
    private ItemCatalogoRepository itemCatalogoRepository;

    @Autowired
    private AsistenteRepository asistenteRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private MetodoPagoRepository metodoPagoRepository;

    @Autowired
    private PujoRepository pujoRepository;

    public List<Subasta> obtenerTodas() {
        return subastaRepository.findAll();
    }

    public List<Subasta> obtenerPorEstado(String estado) {
        return subastaRepository.findByEstado(estado);
    }

    public Subasta obtenerPorId(Integer id) {
        return subastaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subasta no encontrada con el identificador: " + id)); // Debería ser ResourceNotFoundException
    }

    public List<ItemCatalogo> obtenerCatalogo(Integer subastaId) {
        return itemCatalogoRepository.findByCatalogoSubastaIdentificador(subastaId);
    }

    public Asistente unirseASubasta(Integer clienteId, Integer subastaId) {
        Subasta subasta = obtenerPorId(subastaId);
        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado con el identificador: " + clienteId)); // ResourceNotFoundException

        // 1. Validar categoría
        if (getCategoryRank(cliente.getCategoriaCliente()) < getCategoryRank(subasta.getCategoria())) {
            throw new RuntimeException("Tu categoría (" + cliente.getCategoriaCliente() +
                                ") es inferior a la categoría requerida para esta subasta (" + subasta.getCategoria() + ")."); // BusinessLogicException
        }

        // 2. Validar que tenga al menos un método de pago
        List<MetodoPago> pagos = metodoPagoRepository.findByPersonaIdentificador(clienteId);
        if (pagos.isEmpty()) {
            throw new RuntimeException("Debes registrar al menos un medio de pago verificado antes de unirte a una subasta."); // BusinessLogicException
        }

        // 3. Si ya es asistente, retornar existente (la lógica de creación se centraliza)
        Optional<Asistente> existente = asistenteRepository.findByClienteIdentificadorAndSubastaIdentificador(clienteId, subastaId);
        if (existente.isPresent()) {
            return existente.get();
        }

        // 4. Crear asistente
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
                .orElseThrow(() -> new RuntimeException("Item con ID " + iditem + " no encontrado en la subasta " + idSubasta)); // TODO: Cambiar a ResourceNotFoundException
        
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

        return estado;
    }

    /**
     * GET - Obtener historial de pujas de un item
     * GET /api/subastas/{idSubasta}/items/{iditem}/pujas
     */
    public List<HistorialPujaDTO> obtenerHistorialPujas(Integer idSubasta, Integer iditem) {
        // Validar que el item pertenece a la subasta
        if (!itemCatalogoRepository.existsByIdentificadorAndCatalogo_Subasta_Identificador(iditem, idSubasta)) {
             throw new RuntimeException("Item con ID " + iditem + " no encontrado en la subasta " + idSubasta); // TODO: Cambiar a ResourceNotFoundException
        }
        // Obtener todas las pujas ordenadas por monto descendente
        List<Pujo> pujas = pujoRepository.findPujasByItem(iditem);

        return pujas.stream()
                .map(puja -> {
                    HistorialPujaDTO dto = new HistorialPujaDTO();
                    dto.setIdpersona(puja.getAsistente().getCliente().getIdentificador().toString());
                    dto.setNombre(puja.getAsistente().getCliente().getNombre());
                    dto.setMonto(puja.getImporte());
                    // CORRECCIÓN IMPORTANTE: La tabla 'pujos' necesita una columna de fecha/hora.
                    // Si existiera (ej: puja.getFechaHora()), se podría calcular el tiempo transcurrido.
                    dto.setHace("hace unos minutos"); // Simulado por falta de columna en BD
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
                .orElseThrow(() -> new RuntimeException("Item con ID " + iditem + " no encontrado en la subasta " + idSubasta)); // TODO: Cambiar a ResourceNotFoundException
        
        // Calcular límites basados en el precio base
        BigDecimal precioBase = itemCatalogo.getPrecioBase();
        BigDecimal pujaMinima = precioBase.multiply(BigDecimal.valueOf(1.01)); // 1%
        BigDecimal pujaMaxima = precioBase.multiply(BigDecimal.valueOf(1.20)); // 20%

        // Si hay puja líder, usar eso como referencia
        Optional<Pujo> pujaLider = pujoRepository.findFirstByItemIdentificadorOrderByImporteDesc(iditem);
        if (pujaLider.isPresent()) {
            pujaMinima = pujaLider.get().getImporte().multiply(BigDecimal.valueOf(1.01)); // 1% más
            pujaMaxima = pujaLider.get().getImporte().multiply(BigDecimal.valueOf(1.20)); // 20% más
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
                .orElseThrow(() -> new RuntimeException("Item con ID " + iditem + " no encontrado en la subasta " + idSubasta)); // TODO: Cambiar a ResourceNotFoundException

        // Validar que la subasta existe y está abierta
        Optional<Subasta> subasta = subastaRepository.findById(idSubasta);
        if (subasta.isEmpty() || !"abierta".equalsIgnoreCase(subasta.get().getEstado())) {
            throw new RuntimeException("La subasta no existe o no está abierta"); // TODO: Cambiar a BusinessLogicException
        }

        // Validar método de pago
        if (idMetodoPago == null || idMetodoPago.isEmpty()) {
            throw new RuntimeException("Debe proporcionar un método de pago"); // TODO: Cambiar a BusinessLogicException
        }

        Integer metodoPagoId;
        try {
            metodoPagoId = Integer.parseInt(idMetodoPago);
        } catch (NumberFormatException e) {
            throw new RuntimeException("ID de método de pago inválido"); // TODO: Cambiar a BusinessLogicException
        }

        if (!metodoPagoRepository.existsById(metodoPagoId)) {
            throw new RuntimeException("Método de pago no encontrado"); // TODO: Cambiar a ResourceNotFoundException
        }

        // Validar montos contra límites
        LimitesPujaDTO limites = obtenerLimitesPuja(idSubasta, iditem);
        if (monto.compareTo(limites.getPujaMinima()) < 0) {
            throw new RuntimeException("La puja es menor al mínimo permitido: " + limites.getPujaMinima()); // TODO: Cambiar a BusinessLogicException
        }
        if (monto.compareTo(limites.getPujaMaxima()) > 0) {
            throw new RuntimeException("La puja excede el máximo permitido: " + limites.getPujaMaxima()); // TODO: Cambiar a BusinessLogicException
        }

        // Obtener o crear asistente (lógica centralizada y corregida)
        Asistente asistente = getOrCreateAsistente(clienteId, idSubasta);

        // Crear la puja
        Pujo puja = new Pujo();
        puja.setAsistente(asistente);
        puja.setItem(itemCatalogo);
        puja.setImporte(monto);
        puja.setGanador("no");

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
        // CORRECCIÓN: La paginación y el filtrado deben hacerse en la base de datos.
        // 1. Crear un objeto Pageable
        Pageable pageable = PageRequest.of(pagina - 1, limite);

        // 2. Crear un método en SubastaRepository que acepte filtros y paginación.
        // Ejemplo: Page<Subasta> findByEstadoAndCategoria(String estado, String categoria, Pageable pageable);
        // Por simplicidad aquí, asumimos que existe y lo llamamos.
        // List<Subasta> subastasPaginadas = subastaRepository.findByFilters(estado, categoria, pageable).getContent();
        
        // La siguiente implementación es ineficiente y debe ser reemplazada por la de arriba.
        List<Subasta> subastasPaginadas = subastaRepository.findAll(pageable).getContent();

        return subastasPaginadas.stream()
                .map(s -> {
                    SubastaPublicaDTO dto = new SubastaPublicaDTO();
                    dto.setId(s.getIdentificador().toString());
                    dto.setTitulo("Subasta " + s.getIdentificador());
                    dto.setFecha(s.getFecha() != null ? s.getFecha().toString() : "");
                    dto.setCategoria(s.getCategoria());
                    
                    // Contar items
                    List<ItemCatalogo> items = itemCatalogoRepository.findByCatalogoSubastaIdentificador(s.getIdentificador());
                    dto.setCantidaditems(items.size());
                    dto.setImagenPortada("https://via.placeholder.com/400x300?text=Subasta" + s.getIdentificador());
                    
                    return dto;
                })
                .collect(Collectors.toList());
    }

    /**
     * GET - Obtener detalle completo de una subasta
     * GET /api/subastas/{idSubasta}
     */
    public SubastaDetalleDTO obtenerDetalleSubasta(Integer idSubasta) {
        Optional<Subasta> subasta = subastaRepository.findById(idSubasta);
        if (subasta.isEmpty()) {
            throw new RuntimeException("Subasta no encontrada"); // ResourceNotFoundException
        }

        Subasta s = subasta.get();
        SubastaDetalleDTO dto = new SubastaDetalleDTO();
        dto.setId(s.getIdentificador().toString());
        dto.setTitulo("Subasta " + s.getIdentificador());
        dto.setRematador(s.getSubastador() != null ? s.getSubastador().getNombre() : "Rematador Desconocido");
        dto.setUbicacion(s.getUbicacion() != null ? s.getUbicacion() : "Por definir");
        dto.setFecha(s.getFecha() != null ? s.getFecha().toString() : "");

        // Obtener items
        List<ItemCatalogo> items = itemCatalogoRepository.findByCatalogoSubastaIdentificador(idSubasta);
        dto.setCantidadTotalitems(items.size());

        // Crear previsualizaciones (primeros 5 items)
        List<ItemPreviewDTO> previsualizacion = items.stream()
                .limit(5)
                .map(item -> {
                    ItemPreviewDTO preview = new ItemPreviewDTO();
                    preview.setIditem(item.getIdentificador().toString());
                    String nombreProducto = item.getProducto() != null ? item.getProducto().getDescripcionCatalogo() : "Item" + item.getIdentificador();
                    preview.setNombre(nombreProducto);
                    preview.setValorBase(item.getPrecioBase());
                    preview.setImagen("https://via.placeholder.com/200x150?text=" + nombreProducto);
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
            throw new RuntimeException("Subasta no encontrada"); // ResourceNotFoundException
        }

        List<ItemCatalogo> items = itemCatalogoRepository.findByCatalogoSubastaIdentificador(idSubasta);

        return items.stream()
                .map(item -> {
                    ItemCatalogoDTO dto = new ItemCatalogoDTO();
                    dto.setIditem(item.getIdentificador().toString());
                    String nombreProducto = item.getProducto() != null ? item.getProducto().getDescripcionCatalogo() : "Item" + item.getIdentificador();
                    dto.setNombre(nombreProducto);
                    dto.setValorBase(item.getPrecioBase());
                    dto.setImagen("https://via.placeholder.com/200x150?text=" + nombreProducto);
                    return dto;
                })
                .collect(Collectors.toList());
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
            throw new RuntimeException("Subasta no encontrada"); // ResourceNotFoundException
        }

        // Validar que el cliente existe
        Optional<Cliente> cliente = clienteRepository.findById(clienteId);
        if (cliente.isEmpty()) {
            throw new RuntimeException("Cliente no encontrado"); // ResourceNotFoundException
        }

        String categoriaRequerida = subasta.get().getCategoria();
        String categoriaCliente = cliente.get().getCategoriaCliente();

        // Validar categoría
        if (getCategoryRank(categoriaCliente) < getCategoryRank(categoriaRequerida)) {
            resultado.setPuedeUnirse(false);
            resultado.setMotivoRechazo("Tu categoría (" + categoriaCliente + 
                                      ") es inferior a la requerida (" + categoriaRequerida + ")");
            return resultado;
        }

        // Validar que tenga al menos un método de pago
        List<MetodoPago> metodos = metodoPagoRepository.findByPersonaIdentificador(clienteId);
        if (metodos.isEmpty()) {
            resultado.setPuedeUnirse(false);
            resultado.setMotivoRechazo("Debes registrar al menos un método de pago verificado");
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
            throw new RuntimeException(elegibilidad.getMotivoRechazo()); // BusinessLogicException
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
                            .orElseThrow(() -> new RuntimeException("Subasta no encontrada: " + subastaId)); // ResourceNotFoundException

                    Cliente cliente = clienteRepository.findById(clienteId)
                            .orElseThrow(() -> new RuntimeException("Cliente no encontrado: " + clienteId)); // ResourceNotFoundException

                    // Validaciones de elegibilidad (se podrían mover aquí también si se desea)
                    if (getCategoryRank(cliente.getCategoriaCliente()) < getCategoryRank(subasta.getCategoria())) {
                        throw new RuntimeException("Categoría de cliente insuficiente."); // BusinessLogicException
                    }
                    if (metodoPagoRepository.findByPersonaIdentificador(clienteId).isEmpty()) {
                        throw new RuntimeException("Se requiere un método de pago."); // BusinessLogicException
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
}
