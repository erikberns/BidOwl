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
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SolicitudItemService {

    @Autowired
    private SolicitudItemRepository solicitudItemRepository;

    @Autowired
    private PropuestaComercialRepository propuestaComercialRepository;

    @Autowired
    private FotoSolicitudRepository fotoSolicitudRepository;

    @Autowired
    private PersonaRepository personaRepository;

    @Autowired
    private CuentaBancariaRepository cuentaBancariaRepository;

    /**
     * Crear una nueva solicitud de artículo con imágenes
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

        // Validar que el creador existe
        Optional<Persona> creador = personaRepository.findById(creadorId);
        if (creador.isEmpty()) {
            throw new Exception("Persona no encontrada con ID: " + creadorId);
        }

        // Validar campos obligatorios
        if (nombre == null || nombre.isEmpty()) {
            throw new Exception("El nombre del artículo es obligatorio");
        }
        if (declaracionPropiedad == null || !declaracionPropiedad) {
            throw new Exception("Debe aceptar la declaración de propiedad");
        }

        // Crear la solicitud
        SolicitudItem solicitud = new SolicitudItem();
        solicitud.setId(UUID.randomUUID().toString());
        solicitud.setCreador(creador.get());
        solicitud.setNombre(nombre);
        solicitud.setDescripcion(descripcion);
        solicitud.setEsArteODisenador(esArteODisenador);
        solicitud.setNombreCreador(nombreCreador);
        solicitud.setFechaCreacion(fechaCreacion != null ? fechaCreacion : LocalDate.now());
        solicitud.setHistoria(historia);
        solicitud.setDeclaracionPropiedad(declaracionPropiedad);
        solicitud.setEstado("PENDIENTE_REVISION");
        solicitud.setFechaCreacionSolicitud(LocalDateTime.now());
        solicitud.setFechaActualizacion(LocalDateTime.now());

        SolicitudItem solicitudGuardada = solicitudItemRepository.save(solicitud);

        // Guardar las imágenes
        if (imagenes != null && !imagenes.isEmpty()) {
            for (MultipartFile imagen : imagenes) {
                if (!imagen.isEmpty()) {
                    FotoSolicitud foto = new FotoSolicitud();
                    foto.setSolicitudItem(solicitudGuardada);
                    foto.setFoto(imagen.getBytes());
                    foto.setNombreArchivo(imagen.getOriginalFilename());
                    foto.setTipoMime(imagen.getContentType());
                    fotoSolicitudRepository.save(foto);
                }
            }
        }

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("idSolicitud", solicitudGuardada.getId());
        respuesta.put("estado", solicitudGuardada.getEstado());

        return respuesta;
    }

    /**
     * Obtener items activos del creador
     */
    public List<ItemActivoDTO> obtenerItemsActivosPorCreador(Integer creadorId) throws Exception {
        // Validar que el creador existe
        if (!personaRepository.existsById(creadorId)) {
            throw new Exception("Persona no encontrada con ID: " + creadorId);
        }

        List<SolicitudItem> items = solicitudItemRepository.findItemsActivosByCreador(creadorId);
        
        return items.stream()
                .map(item -> new ItemActivoDTO(
                        item.getId(),
                        item.getNombre(),
                        item.getEstado(),
                        item.getUbicacionDeposito(),
                        item.getPolizaSeguro()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Obtener detalle de una solicitud
     */
    public SolicitudItemDetalleDTO obtenerDetalleSolicitud(String idSolicitud) throws Exception {
        Optional<SolicitudItem> solicitud = solicitudItemRepository.findById(idSolicitud);
        if (solicitud.isEmpty()) {
            throw new Exception("Solicitud no encontrada con ID: " + idSolicitud);
        }

        SolicitudItem item = solicitud.get();
        SolicitudItemDetalleDTO detalle = new SolicitudItemDetalleDTO();
        detalle.setId(item.getId());
        detalle.setEstado(item.getEstado());
        detalle.setMotivoRechazo(item.getMotivoRechazo());
        detalle.setFechaCreacion(item.getFechaCreacion());
        detalle.setNombre(item.getNombre());
        detalle.setDescripcion(item.getDescripcion());
        detalle.setHistoria(item.getHistoria());
        detalle.setUbicacionDeposito(item.getUbicacionDeposito());
        detalle.setPolizaSeguro(item.getPolizaSeguro());
        detalle.setCostoDevolucion(item.getCostoDevolucion());

        // Agregar propuesta comercial si existe
        /*
        Optional<PropuestaComercial> propuesta = propuestaComercialRepository.findBySolicitudItem(item);
        if (propuesta.isPresent()) {
            PropuestaComercialDTO propuestaDTO = new PropuestaComercialDTO();
            propuestaDTO.setId(propuesta.get().getId());
            propuestaDTO.setValorBase(propuesta.get().getValorBase());
            propuestaDTO.setComision(propuesta.get().getComision());
            propuestaDTO.setEstado(propuesta.get().getEstado());
            detalle.setPropuesta(propuestaDTO);
        }
        */

        return detalle;
    }

    /**
     * Aceptar acuerdo de envío para inspección
     */
    public AcuerdoEnvioResponse aceptarAcuerdoEnvio(String idSolicitud, Boolean aceptaTerminos) throws Exception {
        if (!aceptaTerminos) {
            throw new Exception("Debe aceptar los términos de envío");
        }

        Optional<SolicitudItem> solicitud = solicitudItemRepository.findById(idSolicitud);
        if (solicitud.isEmpty()) {
            throw new Exception("Solicitud no encontrada con ID: " + idSolicitud);
        }

        SolicitudItem item = solicitud.get();
        item.setAceptacionTerminos(true);
        item.setEstado("ACEPTADO_INSPECCION");
        item.setFechaActualizacion(LocalDateTime.now());
        
        // Asignar ubicación de depósito temporal
        if (item.getUbicacionDeposito() == null) {
            item.setUbicacionDeposito("Depósito Principal - Inspección");
        }

        solicitudItemRepository.save(item);

        AcuerdoEnvioResponse respuesta = new AcuerdoEnvioResponse();
        respuesta.setDireccionEnvio("Depósito Principal, Calle Principal 123");
        respuesta.setInstrucciones("Enviar el artículo en caja segura. Incluir comprobante de envío.");

        return respuesta;
    }

    /**
     * Crear propuesta comercial
     */
    public void crearPropuestaComercial(String idSolicitud, BigDecimal valorBase, BigDecimal comision) throws Exception {
        // Unused / commented out to avoid compile errors
    }

    public Map<String, String> aceptarPropuesta(String idSolicitud, String idCuentaDeposito) throws Exception {
        return Collections.emptyMap();
    }

    public Map<String, Object> rechazarPropuesta(String idSolicitud, BigDecimal costoDevolucion) throws Exception {
        return Collections.emptyMap();
    }

    /**
     * Rechazar solicitud por revisión
     */
    public Map<String, String> rechazarSolicitud(String idSolicitud, String motivo) throws Exception {
        Optional<SolicitudItem> solicitud = solicitudItemRepository.findById(idSolicitud);
        if (solicitud.isEmpty()) {
            throw new Exception("Solicitud no encontrada con ID: " + idSolicitud);
        }

        SolicitudItem item = solicitud.get();
        item.setEstado("RECHAZADO");
        item.setMotivoRechazo(motivo);
        item.setFechaActualizacion(LocalDateTime.now());
        solicitudItemRepository.save(item);

        Map<String, String> respuesta = new HashMap<>();
        respuesta.put("mensaje", "Solicitud rechazada");
        respuesta.put("motivo", motivo);

        return respuesta;
    }
}
