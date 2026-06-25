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
import java.util.stream.Collectors;
import java.util.UUID;

/**
 * Servicio principal encargado de la gestiÃƒÂ³n del ciclo de vida de las subastas/remates,
 * la uniÃƒÂ³n de asistentes, el flujo de lotes y el cierre automÃƒÂ¡tico.
 */
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
    private SubastadorRepository subastadorRepository;

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Autowired
    private ChequeCompromisoService chequeCompromisoService;

    @Autowired
    private ClientePenalizacionService clientePenalizacionService;

    @Autowired
    private PujoService pujoService;

    @Autowired
    private SubastaFotoService subastaFotoService;

    @Autowired
    private SubastaCatalogoMapper subastaCatalogoMapper;

    @Autowired
    private CategoryRankService categoryRankService;

    @Autowired
    private RelativeTimeService relativeTimeService;

    @Autowired
    private PropuestaComercialRepository propuestaComercialRepository;

    @Autowired
    private MonedaService monedaService;

    @Autowired
    private SubastaConexionService subastaConexionService;

    @Autowired
    private MetodoPagoRepository metodoPagoRepository;

    @Autowired
    private CuentaBancariaRepository cuentaBancariaRepository;

    public List<Subasta> obtenerTodas() {
        List<Subasta> subastas = subastaRepository.findAll();
        subastas.forEach(this::checkAndAutoOpen);
        return subastas;
    }

    public List<Subasta> obtenerPorEstado(String estado) {
        return subastaRepository.findByEstado(estado);
    }

    public Subasta obtenerPorId(Integer id) {
        Subasta subasta = subastaRepository.findById(id)
                .orElseThrow(() -> new java.util.NoSuchElementException("Subasta no encontrada con el identificador: " + id));
        return checkAndAutoOpen(subasta);
    }

    public List<ItemCatalogo> obtenerCatalogo(Integer subastaId) {
        return itemCatalogoRepository.findByCatalogoSubastaIdentificador(subastaId);
    }

    @Transactional
    public Asistente unirseASubasta(Integer clienteId, Integer subastaId) {
        Subasta subasta = obtenerPorId(subastaId);
        clientePenalizacionService.validarClienteSinBloqueo(clienteId);
        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new java.util.NoSuchElementException("Cliente no encontrado con el identificador: " + clienteId));

        if (categoryRankService.getRank(cliente.getCategoriaCliente()) < categoryRankService.getRank(subasta.getCategoria())) {
            throw new IllegalArgumentException("Tu categoria (" + cliente.getCategoriaCliente()
                    + ") es inferior a la categoria requerida para esta subasta (" + subasta.getCategoria() + ").");
        }

        subastaConexionService.registrarConexion(clienteId, subastaId, null);

        Optional<Asistente> existente = asistenteRepository.findByClienteIdentificadorAndSubastaIdentificador(clienteId, subastaId);
        if (existente.isPresent()) {
            return existente.get();
        }

        Asistente nuevoAsistente = new Asistente();
        nuevoAsistente.setCliente(cliente);
        nuevoAsistente.setSubasta(subasta);
        nuevoAsistente.setNumeroPostor(generarNumeroPostorUnico(subasta));

        cliente.setRematesAsistidos(cliente.getRematesAsistidos() + 1);
        clienteRepository.save(cliente);

        return asistenteRepository.save(nuevoAsistente);
    }
    /**
     * GET - Obtener estado actual de un item en subasta
     * GET /api/subastas/{idSubasta}/items/{iditem}
     */
    public EstadoItemSubastaDTO obtenerEstadoItem(Integer idSubasta, Integer iditem) {
        // Validar que el item existe y pertenece a la subasta en una sola consulta
        ItemCatalogo itemCatalogo = itemCatalogoRepository.findByIdentificadorAndCatalogo_Subasta_Identificador(iditem, idSubasta)
                .orElseThrow(() -> new java.util.NoSuchElementException("Item con ID " + iditem + " no encontrado en la subasta " + idSubasta));
        
        // Obtener la puja lÃƒÂ­der (mayor monto)
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

        // LÃƒÂ³gica de temporizador de 10 minutos (lote activo inicial) o 1 minuto (despuÃƒÂ©s de puja) y auto-cierre
        List<ItemCatalogo> items = itemCatalogoRepository.findByCatalogoIdentificador(itemCatalogo.getCatalogo().getIdentificador());
        ItemCatalogo primerItemActivo = items.stream()
                .filter(it -> !"si".equalsIgnoreCase(it.getSubastado()))
                .findFirst()
                .orElse(null);

        boolean esActivo = primerItemActivo != null && primerItemActivo.getIdentificador().equals(itemCatalogo.getIdentificador());

        if (itemCatalogo.getFechaFinPuja() != null && (pujaLider.isPresent() || esActivo)) {
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
                        chequeCompromisoService.ejecutarCompromisoGanador(puja);
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
                    dto.setFechaHora(puja.getFechaHora());
                    
                    dto.setHace(relativeTimeService.describe(puja.getFechaHora()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    /**
     * GET - Obtener lÃƒÂ­mites de puja (1% y 20%)
     * GET /api/subastas/{idSubasta}/items/{iditem}/limites-puja
     */
    public LimitesPujaDTO obtenerLimitesPuja(Integer idSubasta, Integer iditem) {
        itemCatalogoRepository.findByIdentificadorAndCatalogo_Subasta_Identificador(iditem, idSubasta)
                .orElseThrow(() -> new java.util.NoSuchElementException("Item con ID " + iditem + " no encontrado en la subasta " + idSubasta));
        return pujoService.obtenerLimitesPuja(iditem);
    }

    /**
     * POST - Crear nueva puja
     * POST /api/subastas/{idSubasta}/items/{iditem}/pujas
     */
    @Transactional
    public CrearPujaResponse crearPuja(Integer idSubasta, Integer iditem, BigDecimal monto, 
                                       String idMetodoPago, Integer clienteId) {
        Pujo puja = pujoService.registrarPujaEnSubasta(idSubasta, iditem, monto, idMetodoPago, clienteId);

        CrearPujaResponse respuesta = new CrearPujaResponse();
        respuesta.setExito(true);
        respuesta.setPujaActual(puja.getImporte());
        respuesta.setMensaje("Puja registrada exitosamente");

        return respuesta;
    }

    /**
     * GET - Obtener catÃƒÂ¡logo pÃƒÂºblico de subastas con filtros y paginaciÃƒÂ³n
     * GET /api/subastas?estado=activa&categoria=oro&pagina=1&limite=10
     */
    public List<SubastaPublicaDTO> obtenerCatalogoPublico(String estado, String categoria, int pagina, int limite) {
        List<Subasta> subastas = subastaRepository.findAll();
        subastas.forEach(this::checkAndAutoOpen);
        
        Pageable pageable = PageRequest.of(pagina - 1, limite);
        return subastaRepository.findCatalogoPublico(estado, categoria, pageable).getContent();
    }

    /**
     * GET - Obtener detalle completo de una subasta
     * GET /api/subastas/{idSubasta}
     */
    public SubastaDetalleDTO obtenerDetalleSubasta(Integer idSubasta) {
        Optional<Subasta> subastaOpt = subastaRepository.findById(idSubasta);
        if (subastaOpt.isEmpty()) {
            throw new java.util.NoSuchElementException("Subasta no encontrada");
        }

        Subasta subasta = checkAndAutoOpen(subastaOpt.get());
        List<ItemCatalogo> items = itemCatalogoRepository.findByCatalogoSubastaIdentificador(idSubasta);
        return subastaCatalogoMapper.toDetalle(subasta, items);
    }

    /**
     * GET - Obtener catÃƒÂ¡logo completo de items de una subasta
     * GET /api/subastas/{idSubasta}/catalogo
     */
    public List<ItemCatalogoDTO> obtenerCatalogoItemsSubasta(Integer idSubasta) {
        Optional<Subasta> subastaOpt = subastaRepository.findById(idSubasta);
        if (subastaOpt.isEmpty()) {
            throw new java.util.NoSuchElementException("Subasta no encontrada");
        }
        checkAndAutoOpen(subastaOpt.get());

        List<ItemCatalogo> items = itemCatalogoRepository.findByCatalogoSubastaIdentificador(idSubasta);
        return items.stream()
                .map(subastaCatalogoMapper::toItemCatalogoDto)
                .collect(Collectors.toList());
    }

    public byte[] obtenerFotoSubastaBytes(Integer subastaId) {
        return subastaFotoService.obtenerFotoSubastaBytes(subastaId);
    }

    public List<Integer> obtenerIdsFotosSubasta(Integer subastaId) {
        return subastaFotoService.obtenerIdsFotosSubasta(subastaId);
    }

    public byte[] obtenerFotoSubastaBytesPorId(Integer fotoId) {
        return subastaFotoService.obtenerFotoSubastaBytesPorId(fotoId);
    }

    /**
     * GET - Verificar elegibilidad para unirse a una subasta
     * GET /api/subastas/{idSubasta}/elegibilidad
     */
    public ElegibilidadDTO verificarElegibilidad(Integer clienteId, Integer idSubasta) {
        ElegibilidadDTO resultado = new ElegibilidadDTO();

        // Validar que la subasta existe
        Optional<Subasta> subastaOpt = subastaRepository.findById(idSubasta);
        if (subastaOpt.isEmpty()) {
            throw new java.util.NoSuchElementException("Subasta no encontrada");
        }
        Subasta subasta = checkAndAutoOpen(subastaOpt.get());

        // Validar que el cliente existe
        Optional<Cliente> cliente = clienteRepository.findById(clienteId);
        if (cliente.isEmpty()) {
            throw new java.util.NoSuchElementException("Cliente no encontrado");
        }

        // Verificar si ya estÃƒÂ¡ unido
        Optional<Asistente> asistenteExistente = asistenteRepository.findByClienteIdentificadorAndSubastaIdentificador(clienteId, idSubasta);
        resultado.setYaUnido(asistenteExistente.isPresent());

        String categoriaRequerida = subasta.getCategoria();
        String categoriaCliente = cliente.get().getCategoriaCliente();
        Optional<ClienteDeudaSubasta> bloqueo = clientePenalizacionService.obtenerBloqueoActivo(clienteId);
        if (bloqueo.isPresent()) {
            resultado.setPuedeUnirse(false);
            resultado.setMotivoRechazo("Tenes una deuda pendiente por " + bloqueo.get().getMontoTotal()
                    + ". Regularizala antes del " + bloqueo.get().getFechaVencimiento() + " para volver a participar.");
            return resultado;
        }

        // Validar categorÃƒÂ­a
        if (categoryRankService.getRank(categoriaCliente) < categoryRankService.getRank(categoriaRequerida)) {
            resultado.setPuedeUnirse(false);
            resultado.setMotivoRechazo("Tu categorÃƒÂ­a (" + categoriaCliente +
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
        return unirseAlStreaming(clienteId, idSubasta, null);
    }

    @Transactional
    public UnirseResponse unirseAlStreaming(Integer clienteId, Integer idSubasta, SesionPersona sesion) {
        ElegibilidadDTO elegibilidad = verificarElegibilidad(clienteId, idSubasta);
        if (!elegibilidad.getPuedeUnirse()) {
            throw new IllegalArgumentException(elegibilidad.getMotivoRechazo());
        }

        subastaConexionService.registrarConexion(clienteId, idSubasta, sesion);
        getOrCreateAsistente(clienteId, idSubasta);

        String tokenWebsocket = UUID.randomUUID().toString();
        String urlStreaming = "wss://streaming.bidowl.com/subastas/" + idSubasta
                + "/items?token=" + tokenWebsocket;

        UnirseResponse respuesta = new UnirseResponse();
        respuesta.setUrlStreaming(urlStreaming);
        respuesta.setTokenWebsocket(tokenWebsocket);

        return respuesta;
    }

    public void desconectarDeSubasta(Integer clienteId, Integer idSubasta) {
        subastaConexionService.desconectar(clienteId, idSubasta);
    }
    /**
     * MÃƒÂ©todo privado para obtener o crear un Asistente.
     * Centraliza la lÃƒÂ³gica, mejora la eficiencia y evita duplicaciÃƒÂ³n.
     */
    private Asistente getOrCreateAsistente(Integer clienteId, Integer subastaId) {
        return asistenteRepository.findByClienteIdentificadorAndSubastaIdentificador(clienteId, subastaId)
                .orElseGet(() -> {
                    Subasta subasta = subastaRepository.findById(subastaId)
                            .orElseThrow(() -> new java.util.NoSuchElementException("Subasta no encontrada: " + subastaId));

                    Cliente cliente = clienteRepository.findById(clienteId)
                            .orElseThrow(() -> new java.util.NoSuchElementException("Cliente no encontrado: " + clienteId));

                    // Validaciones de elegibilidad (se podrÃƒÂ­an mover aquÃƒÂ­ tambiÃƒÂ©n si se desea)
                    if (categoryRankService.getRank(cliente.getCategoriaCliente()) < categoryRankService.getRank(subasta.getCategoria())) {
                        throw new IllegalArgumentException("CategorÃƒÂ­a de cliente insuficiente.");
                    }

                    Asistente nuevoAsistente = new Asistente();
                    nuevoAsistente.setCliente(cliente);
                    nuevoAsistente.setSubasta(subasta);
                    nuevoAsistente.setNumeroPostor(generarNumeroPostorUnico(subasta));
                    
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

        // 3. Crear puja usando el flujo estÃƒÂ¡ndar
        Subasta subasta = subastaRepository.findById(idSubasta)
                .orElseThrow(() -> new java.util.NoSuchElementException("Subasta no encontrada: " + idSubasta));
        MetodoPago metodoPago = obtenerMetodoPagoCompatibleParaSimulacion(cliente, subasta);

        return crearPuja(idSubasta, iditem, monto, metodoPago.getIdentificador().toString(), cliente.getIdentificador());
    }

    private MetodoPago obtenerMetodoPagoCompatibleParaSimulacion(Cliente cliente, Subasta subasta) {
        String monedaSubasta = monedaService.monedaSubasta(subasta);
        return metodoPagoRepository.findByPersonaIdentificador(cliente.getIdentificador()).stream()
                .filter(metodoPago -> monedaSubasta.equals(monedaService.monedaMetodoPago(metodoPago)))
                .findFirst()
                .orElseGet(() -> crearMetodoPagoSimulado(cliente, monedaSubasta));
    }

    private MetodoPago crearMetodoPagoSimulado(Cliente cliente, String moneda) {
        Pais paisDefault = paisRepository.findAll().stream().findFirst().orElse(null);

        CuentaBancaria cuenta = new CuentaBancaria();
        cuenta.setTitularCuenta(cliente.getNombre() + " " + cliente.getApellido());
        cuenta.setNombreBanco("Banco Simulado BidOwl");
        cuenta.setPais(paisDefault);
        cuenta.setMoneda(moneda);
        cuenta.setCbuIban("SIM-" + moneda.toUpperCase() + "-" + cliente.getIdentificador() + "-" + UUID.randomUUID().toString().substring(0, 8));
        CuentaBancaria cuentaGuardada = cuentaBancariaRepository.save(cuenta);

        MetodoPago metodoPago = new MetodoPago();
        metodoPago.setPersona(cliente);
        metodoPago.setCuentaBancaria(cuentaGuardada);
        return metodoPagoRepository.save(metodoPago);
    }

    @Transactional
    public Subasta crearSubastaConCatalogo(SubastaCrearRequest request) throws Exception {
        // 1. Validar fecha (debe ser al menos 10 dÃƒÂ­as posterior a hoy)
        java.time.LocalDate dateFecha;
        try {
            dateFecha = java.time.LocalDate.parse(request.getFecha());
        } catch (Exception e) {
            throw new IllegalArgumentException("Formato de fecha invÃƒÂ¡lido. Debe ser yyyy-MM-dd.");
        }

        boolean saltarValidacion = request.getSaltarValidacionFecha() != null && request.getSaltarValidacionFecha();
        java.time.LocalDate nowInArgentinaDate = java.time.LocalDate.now(java.time.ZoneId.of("America/Argentina/Buenos_Aires"));
        if (!saltarValidacion && dateFecha.isBefore(nowInArgentinaDate.plusDays(10))) {
            throw new IllegalArgumentException("La fecha de la subasta debe ser al menos 10 dÃƒÂ­as posterior a la fecha actual.");
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
            throw new IllegalArgumentException("Formato de hora invÃƒÂ¡lido. Debe ser HH:mm:ss o HH:mm.");
        }

        // Validar que la fecha y hora no estÃƒÂ©n en el pasado
        java.time.LocalDateTime subastaDateTime = java.time.LocalDateTime.of(dateFecha, timeHora);
        java.time.LocalDateTime nowInArgentinaDateTime = java.time.LocalDateTime.now(java.time.ZoneId.of("America/Argentina/Buenos_Aires"));
        if (subastaDateTime.isBefore(nowInArgentinaDateTime)) {
            throw new IllegalArgumentException("La fecha y hora de la subasta no pueden estar en el pasado.");
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
        subasta.setEstado("carrada"); // Default carrada
        subasta.setSubastador(subastador);
        subasta.setUbicacion(request.getUbicacion());
        subasta.setCapacidadAsistentes(request.getCapacidadAsistentes());
        subasta.setTieneDeposito(request.getTieneDeposito() != null ? request.getTieneDeposito() : "no");
        subasta.setSeguridadPropia(request.getSeguridadPropia() != null ? request.getSeguridadPropia() : "no");
        subasta.setCategoria(request.getCategoria() != null ? request.getCategoria() : "comun");
        subasta.setMoneda(monedaService.normalizar(request.getMoneda()));
        subasta.setTitulo(request.getTitulo() != null ? request.getTitulo() : "Subasta");
        subasta.setDescripcion(request.getDescripcion());
        subasta.setDireccionDetallada(request.getDireccionDetallada());

        if (request.getFotoBase64() != null && !request.getFotoBase64().isEmpty()) {
            try {
                String base64Data = request.getFotoBase64();
                if (base64Data.contains(",")) {
                    base64Data = base64Data.split(",")[1];
                }
                byte[] decodedBytes = java.util.Base64.getDecoder().decode(base64Data.trim());
                // Guardar la foto de portada de subasta en el catÃƒÂ¡logo
                subastaFotoService.guardarFotoCatalogo(request.getCatalogoId(), decodedBytes);
            } catch (Exception e) {
                System.err.println("Error decodificando fotoBase64 de la subasta: " + e.getMessage());
            }
        }

        Subasta subastaGuardada = subastaRepository.save(subasta);

        // 5. Vincular catÃƒÂ¡logo existente y actualizar fechaFinPuja si corresponde
        if (request.getCatalogoId() != null) {
            Catalogo catalogo = catalogoRepository.findById(request.getCatalogoId())
                    .orElseThrow(() -> new java.util.NoSuchElementException("CatÃƒÂ¡logo no encontrado con ID: " + request.getCatalogoId()));
            
            if (catalogo.getSubasta() != null) {
                throw new IllegalStateException("El catÃƒÂ¡logo ya se encuentra vinculado a otra subasta.");
            }
            
            validarMonedaCatalogo(catalogo.getIdentificador(), monedaService.monedaSubasta(subastaGuardada));

            catalogo.setSubasta(subastaGuardada);
            catalogoRepository.save(catalogo);

            // Actualizar fechaFinPuja de los ÃƒÂ­tems del catÃƒÂ¡logo que tengan fecha nula
            List<ItemCatalogo> items = itemCatalogoRepository.findByCatalogoIdentificador(catalogo.getIdentificador());
            for (int i = 0; i < items.size(); i++) {
                ItemCatalogo item = items.get(i);
                if (item.getFechaFinPuja() == null) {
                    if (i == 0) {
                        java.time.LocalDateTime inicioArgentina = java.time.LocalDateTime.of(dateFecha, timeHora);
                        java.time.ZonedDateTime zonedDateTime = inicioArgentina.atZone(java.time.ZoneId.of("America/Argentina/Buenos_Aires"));
                        java.time.LocalDateTime inicioSystemDefault = zonedDateTime.withZoneSameInstant(java.time.ZoneId.systemDefault()).toLocalDateTime();
                        item.setFechaFinPuja(inicioSystemDefault.plusMinutes(10));
                    } else {
                        item.setFechaFinPuja(null);
                    }
                    itemCatalogoRepository.save(item);
                }
            }
        }

        return subastaGuardada;
    }

    private void validarMonedaCatalogo(Integer catalogoId, String monedaSubasta) {
        List<ItemCatalogo> items = itemCatalogoRepository.findByCatalogoIdentificador(catalogoId);
        for (ItemCatalogo item : items) {
            PropuestaComercial propuesta = item.getProducto() != null
                    ? propuestaComercialRepository.findByProducto(item.getProducto()).orElse(null)
                    : null;
            String monedaItem = propuesta != null ? monedaService.monedaPropuesta(propuesta) : MonedaService.PESOS;
            monedaService.validarMismaMoneda(monedaSubasta, monedaItem, "La moneda del catalogo");
        }
    }

    @Transactional
    public Subasta guardarFotoSubasta(Integer subastaId, byte[] fotoBytes) {
        subastaFotoService.guardarFotoSubasta(subastaId, fotoBytes);
        return obtenerPorId(subastaId);
    }

    private int generarNumeroPostorUnico(Subasta subasta) {
        int capacidad = (subasta.getCapacidadAsistentes() != null && subasta.getCapacidadAsistentes() > 0)
                ? subasta.getCapacidadAsistentes()
                : 100;

        List<Asistente> asistentesSubasta = asistenteRepository.findBySubastaIdentificador(subasta.getIdentificador());
        java.util.Set<Integer> numerosUsados = asistentesSubasta.stream()
                .map(Asistente::getNumeroPostor)
                .collect(java.util.stream.Collectors.toSet());

        java.util.Random random = new java.util.Random();
        
        if (numerosUsados.size() >= capacidad) {
            capacidad = capacidad * 2;
        }

        int numeroPostor;
        int intentos = 0;
        do {
            numeroPostor = random.nextInt(capacidad) + 1;
            intentos++;
        } while (numerosUsados.contains(numeroPostor) && intentos < 1000);

        return numeroPostor;
    }

    @Transactional
    public Subasta checkAndAutoOpen(Subasta subasta) {
        if (subasta == null) return null;

        List<ItemCatalogo> items = itemCatalogoRepository.findByCatalogoSubastaIdentificador(subasta.getIdentificador());
        boolean todosSubastados = !items.isEmpty() && items.stream().allMatch(it -> "si".equalsIgnoreCase(it.getSubastado()));
        
        if (todosSubastados) {
            if (!"carrada".equalsIgnoreCase(subasta.getEstado())) {
                subasta.setEstado("carrada");
                subasta = subastaRepository.save(subasta);
            }
            return subasta;
        }

        if ("carrada".equalsIgnoreCase(subasta.getEstado()) && subasta.getFecha() != null && subasta.getHora() != null) {
            java.time.LocalDateTime inicio = java.time.LocalDateTime.of(subasta.getFecha(), subasta.getHora());
            java.time.LocalDateTime nowInArgentina = java.time.LocalDateTime.now(java.time.ZoneId.of("America/Argentina/Buenos_Aires"));
            if (nowInArgentina.isAfter(inicio)) {
                if (nowInArgentina.isAfter(inicio.plusHours(24))) {
                    subasta.setEstado("carrada");
                } else {
                    subasta.setEstado("abierta");
                }
                subasta = subastaRepository.save(subasta);
            }
        } else if ("abierta".equalsIgnoreCase(subasta.getEstado()) && subasta.getFecha() != null && subasta.getHora() != null) {
            java.time.LocalDateTime inicio = java.time.LocalDateTime.of(subasta.getFecha(), subasta.getHora());
            java.time.LocalDateTime nowInArgentina = java.time.LocalDateTime.now(java.time.ZoneId.of("America/Argentina/Buenos_Aires"));
            if (nowInArgentina.isAfter(inicio.plusHours(24))) {
                subasta.setEstado("carrada");
                subasta = subastaRepository.save(subasta);
            }
        }
        return subasta;
    }
}

