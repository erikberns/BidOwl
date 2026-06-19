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
            // Spring Boot nombra las columnas en snake_case por defecto.
            jdbcTemplate.update(
                "INSERT INTO duenios (identificador, verificacion_financiera, verificacion_judicial, calificacion_riesgo) VALUES (?, 'no', 'no', 1)",
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
        notificacion.setTitulo("Solicitud de artículo recibida");
        notificacion.setCuerpo("Su solicitud del artículo '" + nombre + "' ha sido recibida y está en proceso de revisión.");
        notificacion.setAccion("show_inspection_request");
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

        // PROPUESTA COMERCIAL (NO SIMULADA)
        // La propuesta debería estar vinculada al 'ItemCatalogo' si ya se creó.
        // Esto asume que al generar una propuesta, se crea una entrada en 'itemsCatalogo'.
        PropuestaComercialDTO propuesta = new PropuestaComercialDTO();
        // SUGERENCIA: Buscar el item en el catálogo relacionado con este producto.
        // Optional<ItemCatalogo> itemCat = itemCatalogoRepository.findByProducto(p);
        // if (itemCat.isPresent()) {
        //     propuesta.setValorBase(itemCat.get().getPrecioBase());
        //     propuesta.setComision(itemCat.get().getComision());
        // }
        // Como la lógica no existe, se mantiene la simulación por ahora, pero se marca como tal.
        propuesta.setValorBase(BigDecimal.valueOf(1000)); // VALOR SIMULADO
        propuesta.setComision(BigDecimal.valueOf(100));   // VALOR SIMULADO
        propuesta.setEstado("PENDIENTE"); // ESTADO SIMULADO
        detalle.setPropuesta(propuesta);

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


        Producto p = producto.get();
        // SUGERENCIA: Aquí debería crearse el 'ItemCatalogo' final con el precio y comisión acordados.
        // El estado del producto debería cambiar a algo como "LISTO_PARA_SUBASTA".
        p.setDisponible("si");
        productoRepository.save(p);

        // SUGERENCIA: Usar un DTO específico en lugar de un Map.
        Map<String, String> respuesta = new HashMap<>();
        // El campo 'estado' no está en la definición del endpoint, pero se mantiene por ahora.
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
        // SUGERENCIA: El estado debería ser "RECHAZADO" o "PENDIENTE_DEVOLUCION".
        p.setDisponible("no");
        productoRepository.save(p);

        // SUGERENCIA: Usar un DTO específico en lugar de un Map.
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("mensaje", "Propuesta rechazada. Se realizará devolución del artículo");
        // El parámetro 'costoDevolucion' no está en la definición del body del endpoint.
        // Debería calcularse o recuperarse de la configuración.
        respuesta.put("costoDevolucion", costoDevolucion != null ? costoDevolucion : BigDecimal.ZERO);

        return respuesta;
    }

    private Integer parseId(String id) throws Exception {
        try {
            return Integer.parseInt(id);
        } catch (NumberFormatException e) {
            throw new Exception("ID de solicitud inválido: " + id);
        }
    }
}
