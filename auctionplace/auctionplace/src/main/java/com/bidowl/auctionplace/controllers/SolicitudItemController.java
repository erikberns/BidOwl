package com.bidowl.auctionplace.controllers;

import com.bidowl.auctionplace.dto.*;
import com.bidowl.auctionplace.service.SesionService;
import com.bidowl.auctionplace.service.SolicitudProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/solicitudes-items")
@CrossOrigin(origins = "*", maxAge = 3600)
public class SolicitudItemController {

    @Autowired
    private SolicitudProductoService solicitudProductoService;

    @Autowired
    private SesionService sesionService;

    /**
     * POST - Crear solicitud de artÃƒÂ­culo
     * POST /api/solicitudes-items
     * 
     * Header: Autorizacion
     * Body (Multipart):
     * {
     *   "imagenes": ["File1", "File6"],
     *   "nombre": "string",
     *   "descripcion": "string",
     *   "esArteODisenador": boolean,
     *   "nombreCreador": "string",
     *   "fechaCreacion": "string",
     *   "historia": "string",
     *   "declaracionPropiedad": boolean
     * }
     * 
     * Response: 201 Created
     * {"idSolicitud": "uuid", "estado": "PENDIENTE_REVISION"}
     */
    @PostMapping
    public ResponseEntity<?> crearSolicitudItem(
            @RequestHeader("Autorizacion") String autorizacion,
            @RequestParam("nombre") String nombre,
            @RequestParam("descripcion") String descripcion,
            @RequestParam("esArteODisenador") Boolean esArteODisenador,
            @RequestParam("nombreCreador") String nombreCreador,
            @RequestParam("fechaCreacion") String fechaCreacionStr,
            @RequestParam("historia") String historia,
            @RequestParam("declaracionPropiedad") Boolean declaracionPropiedad,
            @RequestParam("imagenes") List<MultipartFile> imagenes) {

        try {
            // Validar parÃƒÂ¡metros de entrada
            if (nombre == null || nombre.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ControllerSupport.errorBodyWithTimestamp("El nombre es requerido", null));
            }
            if (descripcion == null || descripcion.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ControllerSupport.errorBodyWithTimestamp("La descripciÃƒÂ³n es requerida", null));
            }
            if (nombreCreador == null || nombreCreador.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ControllerSupport.errorBodyWithTimestamp("El nombre del creador es requerido", null));
            }
            if (esArteODisenador == null || declaracionPropiedad == null) {
                return ResponseEntity.badRequest()
                        .body(ControllerSupport.errorBodyWithTimestamp("Los campos booleanos son requeridos", null));
            }
            if (imagenes == null || imagenes.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ControllerSupport.errorBodyWithTimestamp("Se requiere al menos una imagen", null));
            }

            // Extraer ID del token
            Integer creadorId = ControllerSupport.resolvePersonaId(autorizacion, sesionService);

            LocalDate fechaCreacion = null;
            if (fechaCreacionStr != null && !fechaCreacionStr.isEmpty()) {
                try {
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
                    fechaCreacion = LocalDate.parse(fechaCreacionStr, formatter);
                } catch (Exception e) {
                    return ResponseEntity.badRequest()
                            .body(ControllerSupport.errorBodyWithTimestamp("Formato de fecha invÃƒÂ¡lido. Use yyyy-MM-dd", null));
                }
            }

            Map<String, Object> resultado = solicitudProductoService.crearSolicitudItem(
                    creadorId,
                    nombre,
                    descripcion,
                    esArteODisenador,
                    nombreCreador,
                    fechaCreacion,
                    historia,
                    declaracionPropiedad,
                    imagenes
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(resultado);

        } catch (Exception e) {
            if (e.getMessage().contains("Token") || e.getMessage().contains("no proporcionado")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ControllerSupport.errorBodyWithTimestamp(e.getMessage(), null));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ControllerSupport.errorBodyWithTimestamp("Error interno del servidor: " + e.getMessage(), null));
        }
    }

    /**
     * GET - Obtener items activos del usuario
     * GET /api/personas/yo/items/activos
     * 
     * Header: Autorizacion
     * Response: 200 OK
     * [
     *   {
     *     "iditem": "uuid",
     *     "nombre": "string",
     *     "estado": "EN_DEPOSITO",
     *     "ubicacionDeposito": "string",
     *     "polizaSeguro": "url"
     *   }
     * ]
     */
    @GetMapping("/personas/yo/items/activos")
    public ResponseEntity<?> obtenerItemsActivos(
            @RequestHeader("Autorizacion") String autorizacion) {

        try {
            Integer creadorId = ControllerSupport.resolvePersonaId(autorizacion, sesionService);
            List<ItemActivoDTO> items = solicitudProductoService.obtenerItemsActivosPorCreador(creadorId);
            return ResponseEntity.ok(items);

        } catch (Exception e) {
            if (e.getMessage().contains("Token") || e.getMessage().contains("no proporcionado")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ControllerSupport.errorBodyWithTimestamp(e.getMessage(), null));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ControllerSupport.errorBodyWithTimestamp("Error interno del servidor: " + e.getMessage(), null));
        }
    }

    /**
     * GET - Obtener subastas en las que participa el usuario
     * GET /api/personas/yo/subastas
     * 
     * Header: Autorizacion
     * Response: 200 OK
     * [ ... lista de subastas ... ]
     */
    @GetMapping("/personas/yo/subastas")
    public ResponseEntity<?> obtenerMisSubastas(
            @RequestHeader("Autorizacion") String autorizacion) {
        
        try {
            Integer clienteId = ControllerSupport.resolvePersonaId(autorizacion, sesionService);
            
            // NOTA: NecesitarÃƒÂ­as un mÃƒÂ©todo en tu SubastaService para esto.
            // List<SubastaDTO> misSubastas = subastaService.obtenerSubastasPorParticipante(clienteId);
            
            // Por ahora, devolvemos una respuesta simulada.
            return ResponseEntity.ok(Collections.singletonList("Subasta 1 en la que participo"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ControllerSupport.errorBodyWithTimestamp("Token invÃƒÂ¡lido o no proporcionado", null));
        }
    }


    /**
     * GET - Obtener detalle de solicitud
     * GET /api/solicitudes-items/{idSolicitud}
     * 
     * Path: idSolicitud
     * Header: Autorizacion
     * Response: 200 OK
     * {
     *   "id": "uuid",
     *   "estado": "RECHAZADO/ACEPTADO_INSPECCION/PROPUESTA",
     *   "motivoRechazo": "string",
     *   "propuesta": {"valorBase": 0.0, "comision": 0.0}
     * }
     */
    @GetMapping("/{idSolicitud}")
    public ResponseEntity<?> obtenerDetalleSolicitud(
            @PathVariable String idSolicitud,
            @RequestHeader("Autorizacion") String autorizacion) {

        try {
            if (idSolicitud == null || idSolicitud.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ControllerSupport.errorBodyWithTimestamp("El ID de solicitud es requerido", null));
            }

            ControllerSupport.resolvePersonaId(autorizacion, sesionService);
            SolicitudItemDetalleDTO detalle = solicitudProductoService.obtenerDetalleSolicitud(idSolicitud);
            return ResponseEntity.ok(detalle);

        } catch (Exception e) {
            if (e.getMessage().contains("Token") || e.getMessage().contains("no proporcionado")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ControllerSupport.errorBodyWithTimestamp(e.getMessage(), null));
            } else if (e.getMessage().contains("no encontrada")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ControllerSupport.errorBodyWithTimestamp(e.getMessage(), null));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ControllerSupport.errorBodyWithTimestamp("Error interno del servidor: " + e.getMessage(), null));
        }
    }

    /**
     * POST - Aceptar acuerdo de envÃƒÂ­o para inspecciÃƒÂ³n
     * POST /api/solicitudes-items/{idSolicitud}/acuerdo-envio
     * 
     * Path: idSolicitud
     * Header: Autorizacion
     * Body:
     * {"aceptaTerminos": boolean}
     * 
     * Response: 200 OK
     * {
     *   "direccionEnvio": "string",
     *   "instrucciones": "string"
     * }
     */
    @PostMapping("/{idSolicitud}/acuerdo-envio")
    public ResponseEntity<?> aceptarAcuerdoEnvio(
            @PathVariable String idSolicitud,
            @RequestHeader("Autorizacion") String autorizacion,
            @RequestBody AcuerdoEnvioRequest request) {

        try {
            if (idSolicitud == null || idSolicitud.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ControllerSupport.errorBodyWithTimestamp("El ID de solicitud es requerido", null));
            }

            ControllerSupport.resolvePersonaId(autorizacion, sesionService);
            
            if (request.getAceptaTerminos() == null || !request.getAceptaTerminos()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ControllerSupport.errorBodyWithTimestamp("Debe aceptar los tÃƒÂ©rminos de envÃƒÂ­o", null));
            }

            AcuerdoEnvioResponse respuesta = solicitudProductoService.aceptarAcuerdoEnvio(
                    idSolicitud,
                    request.getAceptaTerminos()
            );

            return ResponseEntity.ok(respuesta);

        } catch (Exception e) {
            if (e.getMessage().contains("Token") || e.getMessage().contains("no proporcionado")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ControllerSupport.errorBodyWithTimestamp(e.getMessage(), null));
            } else if (e.getMessage().contains("no encontrada")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ControllerSupport.errorBodyWithTimestamp(e.getMessage(), null));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ControllerSupport.errorBodyWithTimestamp("Error interno del servidor: " + e.getMessage(), null));
        }
    }

    /**
     * POST - Aceptar propuesta comercial
     * POST /api/solicitudes-items/{idSolicitud}/propuesta/aceptar
     * 
     * Path: idSolicitud
     * Header: Autorizacion
     * Body:
     * {"idCuentaDeposito": "uuid"}
     * 
     * Response: 200 OK
     * {"mensaje": "string"}
     */
    @PostMapping("/{idSolicitud}/propuesta/aceptar")
    public ResponseEntity<?> aceptarPropuesta(
            @PathVariable String idSolicitud,
            @RequestHeader("Autorizacion") String autorizacion,
            @RequestBody PropuestaAceptarRequest request) {

        try {
            if (idSolicitud == null || idSolicitud.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ControllerSupport.errorBodyWithTimestamp("El ID de solicitud es requerido", null));
            }

            ControllerSupport.resolvePersonaId(autorizacion, sesionService);
            
            if (request.getIdCuentaDeposito() == null || request.getIdCuentaDeposito().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ControllerSupport.errorBodyWithTimestamp("El ID de cuenta de depÃƒÂ³sito es requerido", null));
            }
            
            Map<String, String> respuesta = solicitudProductoService.aceptarPropuesta(
                    idSolicitud,
                    request.getIdCuentaDeposito()
            );

            return ResponseEntity.ok(respuesta);

        } catch (Exception e) {
            if (e.getMessage().contains("Token") || e.getMessage().contains("no proporcionado")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ControllerSupport.errorBodyWithTimestamp(e.getMessage(), null));
            } else if (e.getMessage().contains("no encontrada")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ControllerSupport.errorBodyWithTimestamp(e.getMessage(), null));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ControllerSupport.errorBodyWithTimestamp("Error interno del servidor: " + e.getMessage(), null));
        }
    }

    /**
     * POST - Rechazar propuesta comercial
     * POST /api/solicitudes-items/{idSolicitud}/propuesta/rechazar
     * 
     * Path: idSolicitud
     * Header: Autorizacion
     * Body (Optional):
     * {"costoDevolucion": 0.0}
     * 
     * Response: 200 OK
     * {
     *   "mensaje": "string",
     *   "costoDevolucion": 0.0
     * }
     */
    @PostMapping("/{idSolicitud}/propuesta/rechazar")
    public ResponseEntity<?> rechazarPropuesta(
            @PathVariable String idSolicitud,
            @RequestHeader("Autorizacion") String autorizacion,
            @RequestBody(required = false) PropuestaRechazarRequest request) {

        try {
            if (idSolicitud == null || idSolicitud.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ControllerSupport.errorBodyWithTimestamp("El ID de solicitud es requerido", null));
            }

            ControllerSupport.resolvePersonaId(autorizacion, sesionService);
            
            BigDecimal costoDevolucion = BigDecimal.ZERO;
            if (request != null && request.getCostoDevolucion() != null) {
                costoDevolucion = request.getCostoDevolucion();
            }

            Map<String, Object> respuesta = solicitudProductoService.rechazarPropuesta(
                    idSolicitud,
                    costoDevolucion
            );

            return ResponseEntity.ok(respuesta);

        } catch (Exception e) {
            if (e.getMessage().contains("Token") || e.getMessage().contains("no proporcionado")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ControllerSupport.errorBodyWithTimestamp(e.getMessage(), null));
            } else if (e.getMessage().contains("no encontrada")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ControllerSupport.errorBodyWithTimestamp(e.getMessage(), null));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ControllerSupport.errorBodyWithTimestamp("Error interno del servidor: " + e.getMessage(), null));
        }
    }

    /**
     * POST - Crear propuesta comercial para una solicitud
     * POST /api/solicitudes-items/{idSolicitud}/propuesta
     */
    @PostMapping("/{idSolicitud}/propuesta")
    public ResponseEntity<?> enviarPropuestaComercial(
            @PathVariable String idSolicitud,
            @RequestBody PropuestaCrearRequest request) {

        try {
            if (idSolicitud == null || idSolicitud.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ControllerSupport.errorBodyWithTimestamp("El ID de solicitud es requerido", null));
            }
            if (request.getValorBase() == null || request.getComision() == null) {
                return ResponseEntity.badRequest()
                        .body(ControllerSupport.errorBodyWithTimestamp("El valor base y la comisiÃƒÂ³n son requeridos", null));
            }

            LocalDate fechaEstimada = null;
            if (request.getFechaEstimada() != null && !request.getFechaEstimada().isEmpty()) {
                try {
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
                    fechaEstimada = LocalDate.parse(request.getFechaEstimada(), formatter);
                } catch (Exception e) {
                    return ResponseEntity.badRequest()
                            .body(ControllerSupport.errorBodyWithTimestamp("Formato de fecha de subasta invÃƒÂ¡lido. Use yyyy-MM-dd", null));
                }
            }

            solicitudProductoService.enviarPropuestaComercial(
                    idSolicitud,
                    request.getValorBase(),
                    request.getComision(),
                    request.getUbicacionSubasta(),
                    fechaEstimada,
                    request.getMoneda()
            );

            return ResponseEntity.ok(Collections.singletonMap("mensaje", "Propuesta comercial enviada exitosamente"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ControllerSupport.errorBodyWithTimestamp("Error interno del servidor: " + e.getMessage(), null));
        }
    }
}
