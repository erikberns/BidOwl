package com.bidowl.auctionplace.service;

import com.bidowl.auctionplace.dto.*;
import com.bidowl.auctionplace.entity.*;
import com.bidowl.auctionplace.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
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

    public Subasta obtenerPorId(Integer id) throws Exception {
        return subastaRepository.findById(id)
                .orElseThrow(() -> new Exception("Subasta no encontrada con el identificador: " + id));
    }

    public List<ItemCatalogo> obtenerCatalogo(Integer subastaId) {
        return itemCatalogoRepository.findByCatalogoSubastaIdentificador(subastaId);
    }

    public Asistente unirseASubasta(Integer clienteId, Integer subastaId) throws Exception {
        Subasta subasta = obtenerPorId(subastaId);
        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new Exception("Cliente no encontrado con el identificador: " + clienteId));

        // 1. Validar categoría
        if (getCategoryRank(cliente.getCategoriaCliente()) < getCategoryRank(subasta.getCategoria())) {
            throw new Exception("Tu categoría (" + cliente.getCategoriaCliente() + 
                                ") es inferior a la categoría requerida para esta subasta (" + subasta.getCategoria() + ").");
        }

        // 2. Validar que tenga al menos un método de pago
        List<MetodoPago> pagos = metodoPagoRepository.findByPersonaIdentificador(clienteId);
        if (pagos.isEmpty()) {
            throw new Exception("Debes registrar al menos un medio de pago verificado antes de unirte a una subasta.");
        }

        // 3. Si ya es asistente, retornar existente
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

    /**
     * GET - Obtener estado actual de un item en subasta
     * GET /api/subastas/{idSubasta}/items/{iditem}
     */
    public EstadoItemSubastaDTO obtenerEstadoItem(Integer idSubasta, Integer iditem) throws Exception {
        // Validar que el item existe
        Optional<ItemCatalogo> item = itemCatalogoRepository.findById(iditem);
        if (item.isEmpty()) {
            throw new Exception("Item no encontrado con ID: " + iditem);
        }

        ItemCatalogo itemCatalogo = item.get();

        // Validar que el item pertenece a la subasta
        if (!itemCatalogo.getCatalogo().getSubasta().getIdentificador().equals(idSubasta)) {
            throw new Exception("El item no pertenece a la subasta especificada");
        }

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
    public List<HistorialPujaDTO> obtenerHistorialPujas(Integer idSubasta, Integer iditem) throws Exception {
        // Validar que el item existe
        Optional<ItemCatalogo> item = itemCatalogoRepository.findById(iditem);
        if (item.isEmpty()) {
            throw new Exception("Item no encontrado con ID: " + iditem);
        }

        ItemCatalogo itemCatalogo = item.get();

        // Validar que el item pertenece a la subasta
        if (!itemCatalogo.getCatalogo().getSubasta().getIdentificador().equals(idSubasta)) {
            throw new Exception("El item no pertenece a la subasta especificada");
        }

        // Obtener todas las pujas ordenadas por monto descendente
        List<Pujo> pujas = pujoRepository.findPujasByItem(iditem);

        return pujas.stream()
                .map(puja -> {
                    HistorialPujaDTO dto = new HistorialPujaDTO();
                    dto.setIdpersona(puja.getAsistente().getCliente().getIdentificador().toString());
                    dto.setNombre(puja.getAsistente().getCliente().getNombre());
                    dto.setMonto(puja.getImporte());
                    dto.setHace("hace unos minutos"); // Simulado
                    return dto;
                })
                .collect(Collectors.toList());
    }

    /**
     * GET - Obtener límites de puja (1% y 20%)
     * GET /api/subastas/{idSubasta}/items/{iditem}/limites-puja
     */
    public LimitesPujaDTO obtenerLimitesPuja(Integer idSubasta, Integer iditem) throws Exception {
        // Validar que el item existe
        Optional<ItemCatalogo> item = itemCatalogoRepository.findById(iditem);
        if (item.isEmpty()) {
            throw new Exception("Item no encontrado con ID: " + iditem);
        }

        ItemCatalogo itemCatalogo = item.get();

        // Validar que el item pertenece a la subasta
        if (!itemCatalogo.getCatalogo().getSubasta().getIdentificador().equals(idSubasta)) {
            throw new Exception("El item no pertenece a la subasta especificada");
        }

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
                                       String idMetodoPago, Integer clienteId) throws Exception {
        
        // Validar que el item existe
        Optional<ItemCatalogo> item = itemCatalogoRepository.findById(iditem);
        if (item.isEmpty()) {
            throw new Exception("Item no encontrado con ID: " + iditem);
        }

        ItemCatalogo itemCatalogo = item.get();

        // Validar que el item pertenece a la subasta
        if (!itemCatalogo.getCatalogo().getSubasta().getIdentificador().equals(idSubasta)) {
            throw new Exception("El item no pertenece a la subasta especificada");
        }

        // Validar que la subasta existe y está abierta
        Optional<Subasta> subasta = subastaRepository.findById(idSubasta);
        if (subasta.isEmpty() || !"abierta".equalsIgnoreCase(subasta.get().getEstado())) {
            throw new Exception("La subasta no existe o no está abierta");
        }

        // Validar método de pago
        if (idMetodoPago == null || idMetodoPago.isEmpty()) {
            throw new Exception("Debe proporcionar un método de pago");
        }

        Integer metodoPagoId;
        try {
            metodoPagoId = Integer.parseInt(idMetodoPago);
        } catch (NumberFormatException e) {
            throw new Exception("ID de método de pago inválido");
        }

        if (!metodoPagoRepository.existsById(metodoPagoId)) {
            throw new Exception("Método de pago no encontrado");
        }

        // Validar montos contra límites
        LimitesPujaDTO limites = obtenerLimitesPuja(idSubasta, iditem);
        if (monto.compareTo(limites.getPujaMinima()) < 0) {
            throw new Exception("La puja es menor al mínimo permitido: " + limites.getPujaMinima());
        }
        if (monto.compareTo(limites.getPujaMaxima()) > 0) {
            throw new Exception("La puja excede el máximo permitido: " + limites.getPujaMaxima());
        }

        // Obtener el cliente
        Optional<Cliente> cliente = clienteRepository.findById(clienteId);
        if (cliente.isEmpty()) {
            throw new Exception("Cliente no encontrado");
        }

        // Obtener o crear asistente
        List<Asistente> asistentes = asistenteRepository.findAll()
                .stream()
                .filter(a -> a.getCliente().getIdentificador().equals(clienteId) &&
                           a.getSubasta().getIdentificador().equals(idSubasta))
                .collect(Collectors.toList());

        Asistente asistente;
        if (asistentes.isEmpty()) {
            asistente = new Asistente();
            asistente.setCliente(cliente.get());
            asistente.setSubasta(subasta.get());
            asistente.setNumeroPostor((int) (Math.random() * 10000));
            asistenteRepository.save(asistente);
        } else {
            asistente = asistentes.get(0);
        }

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
        List<Subasta> subastas = subastaRepository.findAll();

        // Filtrar por estado si se proporciona
        if (estado != null && !estado.isEmpty()) {
            subastas = subastas.stream()
                    .filter(s -> s.getEstado() != null && s.getEstado().equalsIgnoreCase(estado))
                    .collect(Collectors.toList());
        }

        // Filtrar por categoría si se proporciona
        if (categoria != null && !categoria.isEmpty()) {
            subastas = subastas.stream()
                    .filter(s -> s.getCategoria() != null && s.getCategoria().equalsIgnoreCase(categoria))
                    .collect(Collectors.toList());
        }

        // Aplicar paginación
        int inicio = (pagina - 1) * limite;
        int fin = Math.min(inicio + limite, subastas.size());
        
        List<Subasta> paginadas = subastas.subList(inicio, fin);

        return paginadas.stream()
                .map(s -> {
                    SubastaPublicaDTO dto = new SubastaPublicaDTO();
                    dto.setId(s.getIdentificador().toString());
                    dto.setTitulo(s.getTitulo());
                    dto.setFecha(s.getFecha() != null ? s.getFecha().toString() : "");
                    dto.setCategoria(s.getCategoria());
                    
                    // Contar items
                    List<ItemCatalogo> items = itemCatalogoRepository.findByCatalogoSubastaIdentificador(s.getIdentificador());
                    dto.setCantidaditems(items.size());
                    dto.setImagenPortada("https://via.placeholder.com/400x300?text=" + s.getTitulo());
                    
                    return dto;
                })
                .collect(Collectors.toList());
    }

    /**
     * GET - Obtener detalle completo de una subasta
     * GET /api/subastas/{idSubasta}
     */
    public SubastaDetalleDTO obtenerDetalleSubasta(Integer idSubasta) throws Exception {
        Optional<Subasta> subasta = subastaRepository.findById(idSubasta);
        if (subasta.isEmpty()) {
            throw new Exception("Subasta no encontrada");
        }

        Subasta s = subasta.get();
        SubastaDetalleDTO dto = new SubastaDetalleDTO();
        dto.setId(s.getIdentificador().toString());
        dto.setTitulo(s.getTitulo());
        dto.setRematador(s.getRematador() != null ? s.getRematador() : "Rematador Desconocido");
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
                    preview.setNombre(item.getNombre());
                    preview.setValorBase(item.getPrecioBase());
                    preview.setImagen("https://via.placeholder.com/200x150?text=" + item.getNombre());
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
    public List<ItemCatalogoDTO> obtenerCatalogoItemsSubasta(Integer idSubasta) throws Exception {
        Optional<Subasta> subasta = subastaRepository.findById(idSubasta);
        if (subasta.isEmpty()) {
            throw new Exception("Subasta no encontrada");
        }

        List<ItemCatalogo> items = itemCatalogoRepository.findByCatalogoSubastaIdentificador(idSubasta);

        return items.stream()
                .map(item -> {
                    ItemCatalogoDTO dto = new ItemCatalogoDTO();
                    dto.setIditem(item.getIdentificador().toString());
                    dto.setNombre(item.getNombre());
                    dto.setValorBase(item.getPrecioBase());
                    dto.setImagen("https://via.placeholder.com/200x150?text=" + item.getNombre());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    /**
     * GET - Verificar elegibilidad para unirse a una subasta
     * GET /api/subastas/{idSubasta}/elegibilidad
     */
    public ElegibilidadDTO verificarElegibilidad(Integer clienteId, Integer idSubasta) throws Exception {
        ElegibilidadDTO resultado = new ElegibilidadDTO();

        // Validar que la subasta existe
        Optional<Subasta> subasta = subastaRepository.findById(idSubasta);
        if (subasta.isEmpty()) {
            throw new Exception("Subasta no encontrada");
        }

        // Validar que el cliente existe
        Optional<Cliente> cliente = clienteRepository.findById(clienteId);
        if (cliente.isEmpty()) {
            throw new Exception("Cliente no encontrado");
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
    public UnirseResponse unirseAlStreaming(Integer clienteId, Integer idSubasta) throws Exception {
        // Verificar elegibilidad primero
        ElegibilidadDTO elegibilidad = verificarElegibilidad(clienteId, idSubasta);
        if (!elegibilidad.getPuedeUnirse()) {
            throw new Exception(elegibilidad.getMotivoRechazo());
        }

        // Crear/obtener asistente
        Subasta subasta = subastaRepository.findById(idSubasta)
                .orElseThrow(() -> new Exception("Subasta no encontrada"));
        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new Exception("Cliente no encontrado"));

        List<Asistente> asistentes = asistenteRepository.findAll()
                .stream()
                .filter(a -> a.getCliente().getIdentificador().equals(clienteId) &&
                           a.getSubasta().getIdentificador().equals(idSubasta))
                .collect(Collectors.toList());

        if (asistentes.isEmpty()) {
            Asistente nuevoAsistente = new Asistente();
            nuevoAsistente.setCliente(cliente);
            nuevoAsistente.setSubasta(subasta);
            nuevoAsistente.setNumeroPostor((int) (Math.random() * 10000));
            asistenteRepository.save(nuevoAsistente);
            cliente.setRematesAsistidos(cliente.getRematesAsistidos() + 1);
            clienteRepository.save(cliente);
        }

        // Generar tokens para streaming y websocket
        String tokenWebsocket = UUID.randomUUID().toString();
        String urlStreaming = "wss://streaming.bidowl.com/subastas/" + idSubasta + 
                             "/items?token=" + tokenWebsocket;

        UnirseResponse respuesta = new UnirseResponse();
        respuesta.setUrlStreaming(urlStreaming);
        respuesta.setTokenWebsocket(tokenWebsocket);

        return respuesta;
    }
}
