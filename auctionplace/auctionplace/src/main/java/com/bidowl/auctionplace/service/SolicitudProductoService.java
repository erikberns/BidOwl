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

@Service
public class SolicitudProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private FotoRepository fotoRepository;

    @Autowired
    private PersonaRepository personaRepository;

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Autowired
    private DuenioRepository duenioRepository;

    @Autowired
    private CuentaBancariaRepository cuentaBancariaRepository;

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
            throw new Exception("El usuario debe ser un dueño para crear solicitudes");
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
        List<Producto> productos = productoRepository.findAll()
                .stream()
                .filter(p -> p.getDuenio().getIdentificador().equals(creadorId) && 
                           ("si".equalsIgnoreCase(p.getDisponible()) || p.getIdentificador() != null))
                .collect(Collectors.toList());

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
        Integer id;
        try {
            id = Integer.parseInt(idSolicitud);
        } catch (NumberFormatException e) {
            throw new Exception("ID de solicitud inválido");
        }

        Optional<Producto> producto = productoRepository.findById(id);
        if (producto.isEmpty()) {
            throw new Exception("Solicitud no encontrada con ID: " + idSolicitud);
        }

        Producto p = producto.get();
        SolicitudItemDetalleDTO detalle = new SolicitudItemDetalleDTO();
        detalle.setId(p.getIdentificador().toString());
        detalle.setEstado(p.getDisponible().equalsIgnoreCase("si") ? "ACEPTADO_INSPECCION" : "PENDIENTE_REVISION");
        detalle.setNombre(p.getDescripcionCompleta());
        detalle.setDescripcion(p.getDescripcionCatalogo());
        detalle.setFechaCreacion(p.getFecha());
        detalle.setUbicacionDeposito("Depósito Principal");
        
        if (p.getSeguro() != null) {
            detalle.setPolizaSeguro(p.getSeguro().getNroPoliza());
        }

        // Propuesta comercial (simulada con información del producto)
        PropuestaComercialDTO propuesta = new PropuestaComercialDTO();
        propuesta.setValorBase(BigDecimal.valueOf(1000)); // Valor por defecto
        propuesta.setComision(BigDecimal.valueOf(100));
        propuesta.setEstado("PENDIENTE");
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

        Integer id;
        try {
            id = Integer.parseInt(idSolicitud);
        } catch (NumberFormatException e) {
            throw new Exception("ID de solicitud inválido");
        }

        Optional<Producto> producto = productoRepository.findById(id);
        if (producto.isEmpty()) {
            throw new Exception("Solicitud no encontrada con ID: " + idSolicitud);
        }

        Producto p = producto.get();
        p.setDisponible("si"); // Marcar como disponible después de aceptar términos
        productoRepository.save(p);

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
        Integer id;
        try {
            id = Integer.parseInt(idSolicitud);
        } catch (NumberFormatException e) {
            throw new Exception("ID de solicitud inválido");
        }

        Optional<Producto> producto = productoRepository.findById(id);
        if (producto.isEmpty()) {
            throw new Exception("Solicitud no encontrada con ID: " + idSolicitud);
        }

        // Validar cuenta si se proporciona
        if (idCuentaDeposito != null && !idCuentaDeposito.isEmpty()) {
            try {
                Integer cuentaId = Integer.parseInt(idCuentaDeposito);
                if (!cuentaBancariaRepository.existsById(cuentaId)) {
                    throw new Exception("Cuenta de depósito no encontrada");
                }
            } catch (NumberFormatException e) {
                throw new Exception("ID de cuenta inválido");
            }
        }

        Producto p = producto.get();
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
        Integer id;
        try {
            id = Integer.parseInt(idSolicitud);
        } catch (NumberFormatException e) {
            throw new Exception("ID de solicitud inválido");
        }

        Optional<Producto> producto = productoRepository.findById(id);
        if (producto.isEmpty()) {
            throw new Exception("Solicitud no encontrada con ID: " + idSolicitud);
        }

        Producto p = producto.get();
        p.setDisponible("no");
        productoRepository.save(p);

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("mensaje", "Propuesta rechazada. Se realizará devolución del artículo");
        respuesta.put("costoDevolucion", costoDevolucion != null ? costoDevolucion : BigDecimal.ZERO);

        return respuesta;
    }
}
