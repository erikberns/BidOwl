// Expone catalogos, conexion, elegibilidad, pujas y ciclo de vida de las subastas.
package com.bidowl.auctionplace.controllers;

import com.bidowl.auctionplace.dto.*;
import com.bidowl.auctionplace.entity.Subasta;
import com.bidowl.auctionplace.entity.ItemCatalogo;
import com.bidowl.auctionplace.entity.Asistente;
import com.bidowl.auctionplace.entity.SesionPersona;
import com.bidowl.auctionplace.service.SesionService;
import com.bidowl.auctionplace.service.SubastaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subastas")
@CrossOrigin(origins = "*")
public class SubastaController {

    @Autowired
    private SubastaService subastaService;

    @Autowired
    private com.bidowl.auctionplace.service.ItemCatalogoService itemCatalogoService;

    @Autowired
    private SesionService sesionService;

    @GetMapping
    public ResponseEntity<?> obtenerTodasOCatalogo(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) Integer pagina,
            @RequestParam(required = false) Integer limite,
            @RequestHeader(value = "Autorizacion", required = false) String autorizacion) {
        try {
            if (estado == null && categoria == null && pagina == null && limite == null) {
                return ResponseEntity.ok(subastaService.obtenerTodas());
            } else {
                int p = (pagina != null) ? pagina : 1;
                int l = (limite != null) ? limite : 10;
                List<SubastaPublicaDTO> catalogo = subastaService.obtenerCatalogoPublico(estado, categoria, p, l);
                return ResponseEntity.ok(catalogo);
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ControllerSupport.errorBody(e.getMessage()));
        }
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Subasta>> obtenerPorEstado(@PathVariable String estado) {
        return ResponseEntity.ok(subastaService.obtenerPorEstado(estado));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorIdODetalle(
            @PathVariable Integer id,
            @RequestParam(required = false, defaultValue = "false") boolean detalle,
            @RequestHeader(value = "Autorizacion", required = false) String autorizacion) {
        try {
            if (detalle || (autorizacion != null && !autorizacion.isEmpty())) {
                SubastaDetalleDTO detalleDto = subastaService.obtenerDetalleSubasta(id);
                return ResponseEntity.ok(detalleDto);
            } else {
                Subasta subasta = subastaService.obtenerPorId(id);
                return ResponseEntity.ok(subasta);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ControllerSupport.errorBody(e.getMessage()));
        }
    }

    @GetMapping("/{id}/items")
    public ResponseEntity<List<ItemCatalogo>> obtenerItems(@PathVariable Integer id) {
        return ResponseEntity.ok(subastaService.obtenerCatalogo(id));
    }

    @GetMapping("/{id}/foto")
    public ResponseEntity<byte[]> obtenerFotoSubasta(@PathVariable Integer id) {
        try {
            byte[] foto = subastaService.obtenerFotoSubastaBytes(id);
            if (foto == null) {
                return ResponseEntity.notFound().build();
            }
            return ControllerSupport.imageResponse(foto);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/fotos")
    public ResponseEntity<?> obtenerIdsFotosSubasta(@PathVariable Integer id) {
        try {
            List<Integer> ids = subastaService.obtenerIdsFotosSubasta(id);
            List<String> urls = ids.stream()
                    .map(fotoId -> "/api/subastas/fotos/" + fotoId)
                    .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(urls);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/fotos/{fotoId}")
    public ResponseEntity<byte[]> obtenerFotoPorId(@PathVariable Integer fotoId) {
        try {
            byte[] foto = subastaService.obtenerFotoSubastaBytesPorId(fotoId);
            if (foto == null) {
                return ResponseEntity.notFound().build();
            }
            return ControllerSupport.imageResponse(foto);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/unirse")
    public ResponseEntity<?> unirse(
            @PathVariable Integer id,
            @RequestBody(required = false) Map<String, Integer> requestBody,
            @RequestHeader(value = "Autorizacion", required = false) String autorizacion) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (autorizacion != null && !autorizacion.isEmpty()) {
                SesionPersona sesion = null;
                Integer clienteId;
                try {
                    sesion = sesionService.resolverSesionActiva(autorizacion);
                    clienteId = sesion.getPersona().getIdentificador();
                } catch (Exception ignored) {
                    clienteId = ControllerSupport.resolvePersonaIdOrDefault(autorizacion, sesionService, 1);
                }
                UnirseResponse respuesta = subastaService.unirseAlStreaming(clienteId, id, sesion);
                return ResponseEntity.ok(respuesta);
            }
            if (requestBody != null && requestBody.containsKey("clienteId")) {
                Integer clienteId = requestBody.get("clienteId");
                if (clienteId == null) {
                    throw new Exception("El campo 'clienteId' es requerido.");
                }
                Asistente asistente = subastaService.unirseASubasta(clienteId, id);
                response.put("mensaje", "Te has unido a la subasta con Ã©xito.");
                response.put("asistente", asistente);
                return ResponseEntity.ok(response);
            }
            throw new Exception("Debe proporcionar un token de Autorizacion o un request body con clienteId.");
        } catch (Exception e) {
            if (e.getMessage().contains("no encontrado")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ControllerSupport.errorBody(e.getMessage()));
            } else if (e.getMessage().contains("categorÃ­a") || e.getMessage().contains("mÃ©todo de pago")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ControllerSupport.errorBody(e.getMessage()));
            } else {
                return ResponseEntity.badRequest().body(ControllerSupport.errorBody(e.getMessage()));
            }
        }
    }

    @PostMapping("/{id}/salir")
    public ResponseEntity<?> salir(
            @PathVariable Integer id,
            @RequestHeader("Autorizacion") String autorizacion) {
        try {
            Integer clienteId = ControllerSupport.resolvePersonaIdOrDefault(autorizacion, sesionService, 1);
            subastaService.desconectarDeSubasta(clienteId, id);
            return ResponseEntity.ok(Map.of("mensaje", "Conexion a subasta finalizada."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ControllerSupport.errorBody(e.getMessage()));
        }
    }

    /**
     * GET - Obtener estado actual de un item en subasta
     * GET /api/subastas/{idSubasta}/items/{iditem}
     */
    @GetMapping("/{idSubasta}/items/{iditem}")
    public ResponseEntity<?> obtenerEstadoItem(
            @PathVariable Integer idSubasta,
            @PathVariable Integer iditem,
            @RequestHeader("Autorizacion") String autorizacion) {
        try {
            EstadoItemSubastaDTO estado = subastaService.obtenerEstadoItem(idSubasta, iditem);
            return ResponseEntity.ok(estado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ControllerSupport.errorBody(e.getMessage()));
        }
    }

    /**
     * GET - Obtener historial de pujas de un item
     * GET /api/subastas/{idSubasta}/items/{iditem}/pujas
     */
    @GetMapping("/{idSubasta}/items/{iditem}/pujas")
    public ResponseEntity<?> obtenerHistorialPujas(
            @PathVariable Integer idSubasta,
            @PathVariable Integer iditem,
            @RequestHeader("Autorizacion") String autorizacion) {
        try {
            List<HistorialPujaDTO> historial = subastaService.obtenerHistorialPujas(idSubasta, iditem);
            return ResponseEntity.ok(historial);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ControllerSupport.errorBody(e.getMessage()));
        }
    }

    /**
     * GET - Obtener lÃ­mites de puja
     * GET /api/subastas/{idSubasta}/items/{iditem}/limites-puja
     */
    @GetMapping("/{idSubasta}/items/{iditem}/limites-puja")
    public ResponseEntity<?> obtenerLimitesPuja(
            @PathVariable Integer idSubasta,
            @PathVariable Integer iditem,
            @RequestHeader("Autorizacion") String autorizacion) {
        try {
            LimitesPujaDTO limites = subastaService.obtenerLimitesPuja(idSubasta, iditem);
            return ResponseEntity.ok(limites);
        } catch (Exception e) {
            if (e.getMessage().contains("acceso")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ControllerSupport.errorBody(e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ControllerSupport.errorBody(e.getMessage()));
        }
    }

    /**
     * POST - Crear nueva puja
     * POST /api/subastas/{idSubasta}/items/{iditem}/pujas
     */
    @PostMapping("/{idSubasta}/items/{iditem}/pujas")
    public ResponseEntity<?> crearPuja(
            @PathVariable Integer idSubasta,
            @PathVariable Integer iditem,
            @RequestHeader("Autorizacion") String autorizacion,
            @RequestBody CrearPujaRequest request) {
        try {
            Integer clienteId = ControllerSupport.resolvePersonaIdOrDefault(autorizacion, sesionService, 1);
            
            if (request.getMonto() == null || request.getMonto().compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity.badRequest().body(ControllerSupport.errorBody("El monto debe ser mayor a 0"));
            }

            CrearPujaResponse respuesta = subastaService.crearPuja(
                    idSubasta,
                    iditem,
                    request.getMonto(),
                    request.getIdMetodoPago(),
                    clienteId
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
        } catch (Exception e) {
            if (e.getMessage().contains("conflicto") || e.getMessage().contains("ya existe")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(ControllerSupport.errorBody(e.getMessage()));
            } else if (e.getMessage().contains("acceso") || e.getMessage().contains("no autorizado")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ControllerSupport.errorBody(e.getMessage()));
            } else if (e.getMessage().contains("no encontrado")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ControllerSupport.errorBody(e.getMessage()));
            } else {
                return ResponseEntity.badRequest().body(ControllerSupport.errorBody(e.getMessage()));
            }
        }
    }

    /**
     * POST - Simular puja artificial de otro usuario
     * POST /api/subastas/{idSubasta}/items/{iditem}/simular-puja
     */
    @PostMapping("/{idSubasta}/items/{iditem}/simular-puja")
    public ResponseEntity<?> simularPuja(
            @PathVariable Integer idSubasta,
            @PathVariable Integer iditem,
            @RequestBody(required = false) Map<String, Object> body) {
        try {
            Integer clienteId = null;
            BigDecimal monto = null;
            if (body != null) {
                if (body.containsKey("clienteId") && body.get("clienteId") != null) {
                    clienteId = Integer.parseInt(body.get("clienteId").toString());
                }
                if (body.containsKey("monto") && body.get("monto") != null) {
                    monto = new BigDecimal(body.get("monto").toString());
                }
            }
            CrearPujaResponse respuesta = subastaService.simularPuja(idSubasta, iditem, clienteId, monto);
            return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ControllerSupport.errorBody(e.getMessage()));
        }
    }

    /**
     * GET - Obtener catÃ¡logo de items de una subasta
     * GET /api/subastas/{idSubasta}/catalogo
     */
    @GetMapping("/{idSubasta}/catalogo")
    public ResponseEntity<?> obtenerCatalogoItems(
            @PathVariable Integer idSubasta,
            @RequestHeader(value = "Autorizacion", required = false) String autorizacion) {
        try {
            List<ItemCatalogoDTO> items = subastaService.obtenerCatalogoItemsSubasta(idSubasta);
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ControllerSupport.errorBody(e.getMessage()));
        }
    }

    /**
     * GET - Verificar elegibilidad para unirse a la subasta
     * GET /api/subastas/{idSubasta}/elegibilidad
     */
    @GetMapping("/{idSubasta}/elegibilidad")
    public ResponseEntity<?> verificarElegibilidad(
            @PathVariable Integer idSubasta,
            @RequestHeader("Autorizacion") String autorizacion) {
        try {
            Integer clienteId = ControllerSupport.resolvePersonaIdOrDefault(autorizacion, sesionService, 1);
            ElegibilidadDTO elegibilidad = subastaService.verificarElegibilidad(clienteId, idSubasta);
            return ResponseEntity.ok(elegibilidad);
        } catch (Exception e) {
            if (e.getMessage().contains("no encontrado")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ControllerSupport.errorBody(e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ControllerSupport.errorBody(e.getMessage()));
        }
    }

    /**
     * POST - Crear una nueva subasta con su catÃ¡logo e Ã­tems
     * POST /api/subastas
     */
    @PostMapping
    public ResponseEntity<?> crearSubasta(@RequestBody SubastaCrearRequest request) {
        try {
            Subasta subasta = subastaService.crearSubastaConCatalogo(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(subasta);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(ControllerSupport.errorBody(e.getMessage()));
        } catch (Exception e) {
            return ControllerSupport.errorResponse("Error interno del servidor: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping(value = "/{id}/foto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> guardarFotoSubasta(
            @PathVariable Integer id,
            @RequestParam("foto") MultipartFile foto) {
        try {
            if (foto == null || foto.isEmpty()) {
                return ResponseEntity.badRequest().body(ControllerSupport.errorBody("El archivo de foto es requerido."));
            }
            Subasta subasta = subastaService.guardarFotoSubasta(id, foto.getBytes());
            return ResponseEntity.ok(subasta);
        } catch (Exception e) {
            if (e instanceof java.util.NoSuchElementException) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ControllerSupport.errorBody(e.getMessage()));
            }
            return ResponseEntity.badRequest().body(ControllerSupport.errorBody(e.getMessage()));
        }
    }

    /**
     * POST - Finalizar subasta de un item (manual o test)
     * POST /api/subastas/{idSubasta}/items/{iditem}/finalizar
     */
    @PostMapping("/{idSubasta}/items/{iditem}/finalizar")
    public ResponseEntity<?> finalizarItem(
            @PathVariable Integer idSubasta,
            @PathVariable Integer iditem) {
        try {
            ItemCatalogo item = itemCatalogoService.finalizarSubastaDeItem(iditem);
            return ResponseEntity.ok(item);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ControllerSupport.errorBody(e.getMessage()));
        }
    }
}
