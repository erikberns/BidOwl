package com.bidowl.auctionplace.controllers;

import com.bidowl.auctionplace.dto.*;
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
@RequestMapping("/api")
@CrossOrigin(origins = "*", maxAge = 3600)
public class SolicitudItemController {

    @Autowired
    private SolicitudProductoService solicitudProductoService;

    /**
     * POST - Crear solicitud de artículo
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
    @PostMapping("/solicitudes-items")
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
            // Aquí iría validación de autenticación
            Integer creadorId = extraerIdDelToken(autorizacion);

            LocalDate fechaCreacion = null;
            if (fechaCreacionStr != null && !fechaCreacionStr.isEmpty()) {
                try {
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
                    fechaCreacion = LocalDate.parse(fechaCreacionStr, formatter);
                } catch (Exception e) {
                    return ResponseEntity.badRequest()
                            .body(crearErrorMap("Formato de fecha inválido. Use yyyy-MM-dd", null));
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
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(crearErrorMap(e.getMessage(), null));
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
            Integer creadorId = extraerIdDelToken(autorizacion);
            List<ItemActivoDTO> items = solicitudProductoService.obtenerItemsActivosPorCreador(creadorId);
            return ResponseEntity.ok(items);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(crearErrorMap(e.getMessage(), null));
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
    @GetMapping("/solicitudes-items/{idSolicitud}")
    public ResponseEntity<?> obtenerDetalleSolicitud(
            @PathVariable String idSolicitud,
            @RequestHeader("Autorizacion") String autorizacion) {

        try {
            extraerIdDelToken(autorizacion);
            SolicitudItemDetalleDTO detalle = solicitudProductoService.obtenerDetalleSolicitud(idSolicitud);
            return ResponseEntity.ok(detalle);

        } catch (Exception e) {
            if (e.getMessage().contains("no encontrada")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(crearErrorMap(e.getMessage(), null));
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(crearErrorMap(e.getMessage(), null));
        }
    }

    /**
     * POST - Aceptar acuerdo de envío para inspección
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
    @PostMapping("/solicitudes-items/{idSolicitud}/acuerdo-envio")
    public ResponseEntity<?> aceptarAcuerdoEnvio(
            @PathVariable String idSolicitud,
            @RequestHeader("Autorizacion") String autorizacion,
            @RequestBody AcuerdoEnvioRequest request) {

        try {
            extraerIdDelToken(autorizacion);
            
            if (request.getAceptaTerminos() == null || !request.getAceptaTerminos()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(crearErrorMap("Debe aceptar los términos de envío", null));
            }

            AcuerdoEnvioResponse respuesta = solicitudProductoService.aceptarAcuerdoEnvio(
                    idSolicitud,
                    request.getAceptaTerminos()
            );

            return ResponseEntity.ok(respuesta);

        } catch (Exception e) {
            if (e.getMessage().contains("no encontrada")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(crearErrorMap(e.getMessage(), null));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(crearErrorMap(e.getMessage(), null));
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
    @PostMapping("/solicitudes-items/{idSolicitud}/propuesta/aceptar")
    public ResponseEntity<?> aceptarPropuesta(
            @PathVariable String idSolicitud,
            @RequestHeader("Autorizacion") String autorizacion,
            @RequestBody PropuestaAceptarRequest request) {

        try {
            extraerIdDelToken(autorizacion);
            
            Map<String, String> respuesta = solicitudProductoService.aceptarPropuesta(
                    idSolicitud,
                    request.getIdCuentaDeposito()
            );

            return ResponseEntity.ok(respuesta);

        } catch (Exception e) {
            if (e.getMessage().contains("no encontrada")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(crearErrorMap(e.getMessage(), null));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(crearErrorMap(e.getMessage(), null));
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
    @PostMapping("/solicitudes-items/{idSolicitud}/propuesta/rechazar")
    public ResponseEntity<?> rechazarPropuesta(
            @PathVariable String idSolicitud,
            @RequestHeader("Autorizacion") String autorizacion,
            @RequestBody(required = false) Map<String, Object> body) {

        try {
            extraerIdDelToken(autorizacion);
            
            BigDecimal costoDevolucion = BigDecimal.ZERO;
            if (body != null && body.containsKey("costoDevolucion")) {
                costoDevolucion = new BigDecimal(body.get("costoDevolucion").toString());
            }

            Map<String, Object> respuesta = solicitudProductoService.rechazarPropuesta(
                    idSolicitud,
                    costoDevolucion
            );

            return ResponseEntity.ok(respuesta);

        } catch (Exception e) {
            if (e.getMessage().contains("no encontrada")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(crearErrorMap(e.getMessage(), null));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(crearErrorMap(e.getMessage(), null));
        }
    }

    /**
     * Método auxiliar para extraer ID del token (simulado)
     * En producción, usar JWT o similar
     */
    private Integer extraerIdDelToken(String token) throws Exception {
        if (token == null || token.isEmpty()) {
            throw new Exception("Token no proporcionado");
        }
        // Simulación: extraer ID del header
        // En producción, validar JWT
        try {
            // Por ahora, retornar un ID por defecto (cambiar según implementación real)
            return 1;
        } catch (Exception e) {
            throw new Exception("Token inválido");
        }
    }

    /**
     * Método auxiliar para crear mapas de error consistentes
     */
    private Map<String, Object> crearErrorMap(String mensaje, Integer codigo) {
        Map<String, Object> error = new HashMap<>();
        error.put("error", mensaje);
        error.put("timestamp", LocalDate.now());
        if (codigo != null) {
            error.put("codigo", codigo);
        }
        return error;
    }
}
