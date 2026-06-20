package com.bidowl.auctionplace.service;

import com.bidowl.auctionplace.dto.*;
import com.bidowl.auctionplace.entity.*;
import com.bidowl.auctionplace.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.jdbc.core.JdbcTemplate;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Service
public class SolicitudProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private FotoRepository fotoRepository;

    @Autowired
    private PersonaRepository personaRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Autowired
    private DuenioRepository duenioRepository;

    @Autowired
    private NotificacionRepository notificacionRepository;

    @Autowired
    private PropuestaComercialRepository propuestaComercialRepository;

    @Autowired
    private SeguroRepository seguroRepository;

    @Autowired
    private MetodoPagoRepository metodoPagoRepository;

    /**
     * Crear una nueva solicitud de artículo (usa tabla productos)
     * POST /api/solicitudes-items
     */
    public Map<String, Object> crearSolicitudItem(
            Integer creadorId,
            String nombre,
            String descripcion,
            Boolean esArteODisenador,
            String nombreCreador,
            LocalDate fechaCreacion,
            String historia,
            Boolean declaracionPropiedad,
            List<MultipartFile> imagenes) throws Exception {

        // Validar que el creador existe y es Dueño
        Optional<Persona> personaOpt = personaRepository.findById(creadorId);
        if (personaOpt.isEmpty()) {
            throw new Exception("Persona no encontrada con ID: " + creadorId);
        }

        Optional<Duenio> duenioOpt = duenioRepository.findById(creadorId);
        if (duenioOpt.isEmpty()) {
            // Verificar si es cliente
            Optional<Cliente> clienteOpt = clienteRepository.findById(creadorId);
            if (clienteOpt.isEmpty()) {
                throw new Exception("El usuario debe ser un cliente validado para crear solicitudes");
            }
            
            // Promover el cliente a dueño insertando el registro en la tabla duenios
            // Con nombres de columnas coincidentes con SQL Server y aportando el verificador por defecto (revisor 1)
            jdbcTemplate.update(
                "INSERT INTO duenios (identificador, verificaciónFinanciera, verificaciónJudicial, calificacionRiesgo, verificador) VALUES (?, 'no', 'no', 1, 1)",
                creadorId
            );
            
            // Limpiar caché de JPA para forzar recarga de la entidad correcta
            entityManager.clear();
            
            duenioOpt = duenioRepository.findById(creadorId);
            if (duenioOpt.isEmpty()) {
                throw new Exception("Error al promover el usuario a dueño.");
            }
        }

        // Validar campos obligatorios
        if (nombre == null || nombre.isEmpty()) {
            throw new Exception("El nombre del artículo es obligatorio");
        }
        if (descripcion == null || descripcion.isEmpty()) {
            throw new Exception("La descripción es obligatoria");
        }
        if (declaracionPropiedad == null || !declaracionPropiedad) {
            throw new Exception("Debe aceptar la declaración de propiedad");
        }

        // Crear un revisor provisional (empleado por defecto)
        Optional<Empleado> revisor = empleadoRepository.findById(1);
        if (revisor.isEmpty()) {
            throw new Exception("No hay empleados disponibles para revisar");
        }

        // Crear el producto como solicitud
        Producto producto = new Producto();
        producto.setFecha(fechaCreacion != null ? fechaCreacion : LocalDate.now());
        producto.setDisponible("no"); // Inicia como no disponible mientras está en revisión
        producto.setDescripcionCatalogo(descripcion);
        producto.setDescripcionCompleta(nombre); // Usar nombre como descripción completa
        producto.setRevisor(revisor.get());
        producto.setDuenio(duenioOpt.get());

        Producto productoGuardado = productoRepository.save(producto);

        // Guardar las imágenes
        if (imagenes != null && !imagenes.isEmpty()) {
            for (MultipartFile imagen : imagenes) {
                if (!imagen.isEmpty()) {
                    try {
                        Foto foto = new Foto();
                        foto.setProducto(productoGuardado);
                        foto.setFoto(imagen.getBytes());
                        fotoRepository.save(foto);
                    } catch (IOException e) {
                        throw new Exception("Error al procesar imagen: " + e.getMessage());
                    }
                }
            }
        }

        // Generate notification
        Notificacion notificacion = new Notificacion();
        notificacion.setPersonaId(creadorId);
        notificacion.setTitulo("Su solicitud de artículo publicado fue revisada");
        notificacion.setCuerpo("Su solicitud del artículo '" + nombre + "' fue revisada por nuestro equipo y está lista para el siguiente paso de inspección física.");
        notificacion.setAccion("show_inspection_request:" + productoGuardado.getIdentificador());
        notificacion.setLeida(false);
        notificacion.setFecha(java.time.LocalDateTime.now());
        notificacionRepository.save(notificacion);

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("idSolicitud", productoGuardado.getIdentificador().toString());
        respuesta.put("estado", "PENDIENTE_REVISION");

        return respuesta;
    }

    /**
     * Obtener items activos del creador/dueño
     * GET /api/personas/yo/items/activos
     */
    public List<ItemActivoDTO> obtenerItemsActivosPorCreador(Integer creadorId) throws Exception {
        // Validar que es un dueño
        if (!duenioRepository.existsById(creadorId)) {
            throw new Exception("Usuario no es dueño");
        }

        Optional<Duenio> duenio = duenioRepository.findById(creadorId);
        if (duenio.isEmpty()) {
            throw new Exception("Dueño no encontrado");
        }

        // Obtener productos del dueño que están activos (disponibles o con propuesta)
        List<Producto> productos = productoRepository.findByDuenioIdentificador(creadorId);

        return productos.stream()
                .map(p -> new ItemActivoDTO(
                        p.getIdentificador().toString(),
                        p.getDescripcionCompleta(),
                        p.getDisponible().equalsIgnoreCase("si") ? "EN_DEPOSITO" : "EN_REVISION",
                        "Depósito Principal",
                        p.getSeguro() != null ? p.getSeguro().getNroPoliza() : null
                ))
                .collect(Collectors.toList());
    }

    /**
     * Obtener detalle de una solicitud
     * GET /api/solicitudes-items/{idSolicitud}
     */
    public SolicitudItemDetalleDTO obtenerDetalleSolicitud(String idSolicitud) throws Exception {
        Integer id = parseId(idSolicitud);

        // SUGERENCIA: En lugar de Optional, puedes hacer que el repositorio lance la excepción.
        // Producto p = productoRepository.findById(id).orElseThrow(() -> new Exception("Solicitud no encontrada"));
        Optional<Producto> producto = productoRepository.findById(id);
        if (producto.isEmpty()) {
            throw new Exception("Solicitud no encontrada con ID: " + idSolicitud);
        }

        Producto p = producto.get();
        SolicitudItemDetalleDTO detalle = new SolicitudItemDetalleDTO();
        detalle.setId(p.getIdentificador().toString());
        detalle.setNombre(p.getDescripcionCompleta());
        detalle.setDescripcion(p.getDescripcionCatalogo());
        detalle.setFechaCreacion(p.getFecha());
        detalle.setUbicacionDeposito("Depósito Principal");
        
        // LÓGICA DE ESTADO MEJORADA (requiere una columna 'estado' en la tabla 'productos')
        // Ejemplo: p.getEstado() podría devolver "RECHAZADO", "ACEPTADO_INSPECCION", "PROPUESTA_ENVIADA"
        // Por ahora, simulamos basado en 'disponible'
        String estadoActual = p.getDisponible().equalsIgnoreCase("si") ? "ACEPTADO_INSPECCION" : "PENDIENTE_REVISION";
        detalle.setEstado(estadoActual);

        // Si el estado fuera "RECHAZADO", deberías tener una columna 'motivoRechazo' en la tabla.
        // detalle.setMotivoRechazo(p.getMotivoRechazo());

        if (p.getSeguro() != null) {
            detalle.setPolizaSeguro(p.getSeguro().getNroPoliza());
        }

        // PROPUESTA COMERCIAL REAL (DESDE BASE DE DATOS)
        Optional<PropuestaComercial> propuestaOpt = propuestaComercialRepository.findByProducto(p);
        if (propuestaOpt.isPresent()) {
            PropuestaComercial prop = propuestaOpt.get();
            PropuestaComercialDTO propuestaDTO = new PropuestaComercialDTO();
            propuestaDTO.setId(prop.getId());
            propuestaDTO.setValorBase(prop.getValorBase());
            propuestaDTO.setComision(prop.getComision());
            propuestaDTO.setEstado(prop.getEstado());
            propuestaDTO.setUbicacionSubasta(prop.getUbicacionSubasta());
            propuestaDTO.setFechaEstimada(prop.getFechaEstimada() != null ? prop.getFechaEstimada().toString() : null);
            detalle.setPropuesta(propuestaDTO);
            
            // Sincronizar estado de la solicitud con el estado de la propuesta
            if ("PENDIENTE".equals(prop.getEstado())) {
                detalle.setEstado("PROPUESTA");
            } else if ("ACEPTADA".equals(prop.getEstado())) {
                detalle.setEstado("ACEPTADO");
            } else if ("RECHAZADA".equals(prop.getEstado())) {
                detalle.setEstado("RECHAZADO");
            }
        }

        return detalle;
    }

    /**
     * Aceptar acuerdo de envío para inspección
     * POST /api/solicitudes-items/{idSolicitud}/acuerdo-envio
     */
    public AcuerdoEnvioResponse aceptarAcuerdoEnvio(String idSolicitud, Boolean aceptaTerminos) throws Exception {
        if (!aceptaTerminos) {
            throw new Exception("Debe aceptar los términos de envío");
        }
        Integer id = parseId(idSolicitud);

        Optional<Producto> producto = productoRepository.findById(id);
        if (producto.isEmpty()) {
            throw new Exception("Solicitud no encontrada con ID: " + idSolicitud);
        }

        Producto p = producto.get();
        // SUGERENCIA: Usar un estado más descriptivo, ej: "PENDIENTE_INSPECCION"
        p.setDisponible("si"); 
        productoRepository.save(p);

        // SUGERENCIA: Estos valores no deberían estar hardcodeados.
        AcuerdoEnvioResponse respuesta = new AcuerdoEnvioResponse();
        respuesta.setDireccionEnvio("Depósito Principal, Calle Principal 123");
        respuesta.setInstrucciones("Enviar el artículo en caja segura. Incluir comprobante de envío. Teléfono contacto: +54-11-XXXX-XXXX");

        return respuesta;
    }

    /**
     * Aceptar propuesta comercial
     * POST /api/solicitudes-items/{idSolicitud}/propuesta/aceptar
     */
    public Map<String, String> aceptarPropuesta(String idSolicitud, String idCuentaDeposito) throws Exception {
        Integer id = parseId(idSolicitud);
        Optional<Producto> producto = productoRepository.findById(id);
        if (producto.isEmpty()) {
            throw new Exception("Solicitud no encontrada con ID: " + idSolicitud);
        }

        // Validate that the payment method selected is not a certified cheque
        if (idCuentaDeposito != null && !idCuentaDeposito.isEmpty()) {
            try {
                Integer mpId = Integer.parseInt(idCuentaDeposito);
                Optional<MetodoPago> mpOpt = metodoPagoRepository.findById(mpId);
                if (mpOpt.isPresent() && mpOpt.get().getChequeCertificado() != null) {
                    throw new IllegalArgumentException("No se pueden recibir comisiones en cheques certificados.");
                }
            } catch (NumberFormatException e) {
                // Ignore for mock methods (e.g. pm_1, pm_2) to preserve compatibility
            }
        }

        Producto p = producto.get();

        Optional<PropuestaComercial> propuestaOpt = propuestaComercialRepository.findByProducto(p);
        BigDecimal basePrice = BigDecimal.ZERO;
        if (propuestaOpt.isPresent()) {
            PropuestaComercial prop = propuestaOpt.get();
            prop.setEstado("ACEPTADA");
            propuestaComercialRepository.save(prop);
            if (prop.getValorBase() != null) {
                basePrice = prop.getValorBase();
            }
        }

        // Calculate coverage at 110% of base price
        BigDecimal coverageAmount = basePrice.multiply(BigDecimal.valueOf(1.10));

        // Generate unique policy number
        String policyNumber = "POL-" + String.format("%06d", new Random().nextInt(1000000));

        Seguro seguro = new Seguro();
        seguro.setNroPoliza(policyNumber);
        seguro.setCompania("La Segunda Cooperativa de Seguros");
        seguro.setPolizaCombinada("no");
        seguro.setImporte(coverageAmount);
        seguroRepository.save(seguro);

        p.setSeguro(seguro);
        p.setDisponible("si");
        productoRepository.save(p);

        Map<String, String> respuesta = new HashMap<>();
        respuesta.put("mensaje", "Propuesta aceptada correctamente");
        respuesta.put("estado", "ACEPTADO");

        return respuesta;
    }

    /**
     * Rechazar propuesta comercial
     * POST /api/solicitudes-items/{idSolicitud}/propuesta/rechazar
     */
    public Map<String, Object> rechazarPropuesta(String idSolicitud, BigDecimal costoDevolucion) throws Exception {
        Integer id = parseId(idSolicitud);
        Optional<Producto> producto = productoRepository.findById(id);
        if (producto.isEmpty()) {
            throw new Exception("Solicitud no encontrada con ID: " + idSolicitud);
        }

        Producto p = producto.get();
        p.setDisponible("no");
        productoRepository.save(p);

        Optional<PropuestaComercial> propuestaOpt = propuestaComercialRepository.findByProducto(p);
        if (propuestaOpt.isPresent()) {
            PropuestaComercial prop = propuestaOpt.get();
            prop.setEstado("RECHAZADA");
            propuestaComercialRepository.save(prop);
        }

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("mensaje", "Propuesta rechazada. Se realizará devolución del artículo");
        respuesta.put("costoDevolucion", costoDevolucion != null ? costoDevolucion : BigDecimal.ZERO);

        return respuesta;
    }

    /**
     * Enviar propuesta comercial para una solicitud/producto
     */
    public void enviarPropuestaComercial(
            String idSolicitud,
            BigDecimal valorBase,
            BigDecimal comision,
            String ubicacionSubasta,
            LocalDate fechaEstimada) throws Exception {

        Integer id = parseId(idSolicitud);
        Optional<Producto> productoOpt = productoRepository.findById(id);
        if (productoOpt.isEmpty()) {
            throw new Exception("Solicitud no encontrada con ID: " + idSolicitud);
        }

        Producto p = productoOpt.get();

        PropuestaComercial propuesta = propuestaComercialRepository.findByProducto(p)
                .orElse(new PropuestaComercial());

        propuesta.setProducto(p);
        propuesta.setValorBase(valorBase);
        propuesta.setComision(comision);
        propuesta.setUbicacionSubasta(ubicacionSubasta);
        propuesta.setFechaEstimada(fechaEstimada);
        propuesta.setEstado("PENDIENTE");

        propuestaComercialRepository.save(propuesta);

        // Generar notificación para el usuario dueño del producto
        if (p.getDuenio() != null) {
            Notificacion notificacion = new Notificacion();
            notificacion.setPersonaId(p.getDuenio().getIdentificador());
            notificacion.setTitulo("Su solicitud de artículo publicado fue revisada");
            notificacion.setCuerpo("Su solicitud del artículo '" + (p.getDescripcionCompleta() != null ? p.getDescripcionCompleta() : "ID " + p.getIdentificador()) + "' fue revisada por nuestro equipo y está lista para el siguiente paso de inspección física.");
            notificacion.setAccion("show_inspection_result:" + p.getIdentificador());
            notificacion.setLeida(false);
            notificacion.setFecha(java.time.LocalDateTime.now());
            notificacionRepository.save(notificacion);
        }
    }

    private Integer parseId(String id) throws Exception {
        try {
            return Integer.parseInt(id);
        } catch (NumberFormatException e) {
            throw new Exception("ID de solicitud inválido: " + id);
        }
    }
}
