package com.bidowl.auctionplace.controllers;

import com.bidowl.auctionplace.dto.*;
import com.bidowl.auctionplace.entity.Subasta;
import com.bidowl.auctionplace.entity.ItemCatalogo;
import com.bidowl.auctionplace.entity.Asistente;
import com.bidowl.auctionplace.service.SubastaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
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

    @GetMapping
    public ResponseEntity<List<Subasta>> obtenerTodas() {
        return ResponseEntity.ok(subastaService.obtenerTodas());
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Subasta>> obtenerPorEstado(@PathVariable String estado) {
        return ResponseEntity.ok(subastaService.obtenerPorEstado(estado));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Subasta subasta = subastaService.obtenerPorId(id);
            return ResponseEntity.ok(subasta);
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/{id}/items")
    public ResponseEntity<List<ItemCatalogo>> obtenerItems(@PathVariable Integer id) {
        return ResponseEntity.ok(subastaService.obtenerCatalogo(id));
    }

    @PostMapping("/{id}/unirse")
    public ResponseEntity<?> unirse(@PathVariable Integer id, @RequestBody Map<String, Integer> requestBody) {
        Map<String, Object> response = new HashMap<>();
        try {
            Integer clienteId = requestBody.get("clienteId");
            if (clienteId == null) {
                throw new Exception("El campo 'clienteId' es requerido.");
            }
            Asistente asistente = subastaService.unirseASubasta(clienteId, id);
            response.put("mensaje", "Te has unido a la subasta con éxito.");
            response.put("asistente", asistente);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
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
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
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
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    /**
     * GET - Obtener límites de puja
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
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            if (e.getMessage().contains("acceso")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
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
            // Extraer clienteId del token (simulado)
            Integer clienteId = extraerIdDelToken(autorizacion);
            
            if (request.getMonto() == null || request.getMonto().compareTo(BigDecimal.ZERO) <= 0) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "El monto debe ser mayor a 0");
                return ResponseEntity.badRequest().body(error);
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
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            
            if (e.getMessage().contains("conflicto") || e.getMessage().contains("ya existe")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
            } else if (e.getMessage().contains("acceso") || e.getMessage().contains("no autorizado")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            } else if (e.getMessage().contains("no encontrado")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            } else {
                return ResponseEntity.badRequest().body(error);
            }
        }
    }

    /**
     * Método auxiliar para extraer ID del token (simulado)
     */
    private Integer extraerIdDelToken(String token) throws Exception {
        if (token == null || token.isEmpty()) {
            throw new Exception("Token no proporcionado");
        }
        // En producción, validar JWT
        return 1; // Por ahora retornar un ID por defecto
    }

    /**
     * GET - Obtener catálogo público de subastas
     * GET /api/subastas?estado=activa&categoria=oro&pagina=1&limite=10
     */
    @GetMapping
    public ResponseEntity<?> obtenerCatalogo(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String categoria,
            @RequestParam(defaultValue = "1") int pagina,
            @RequestParam(defaultValue = "10") int limite,
            @RequestHeader(value = "Autorizacion", required = false) String autorizacion) {
        try {
            List<SubastaPublicaDTO> catalogo = subastaService.obtenerCatalogoPublico(estado, categoria, pagina, limite);
            return ResponseEntity.ok(catalogo);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * GET - Obtener detalle de una subasta
     * GET /api/subastas/{idSubasta}
     */
    @GetMapping("/{idSubasta}")
    public ResponseEntity<?> obtenerDetalle(
            @PathVariable Integer idSubasta,
            @RequestHeader(value = "Autorizacion", required = false) String autorizacion) {
        try {
            SubastaDetalleDTO detalle = subastaService.obtenerDetalleSubasta(idSubasta);
            return ResponseEntity.ok(detalle);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    /**
     * GET - Obtener catálogo de items de una subasta
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
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
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
            Integer clienteId = extraerIdDelToken(autorizacion);
            ElegibilidadDTO elegibilidad = subastaService.verificarElegibilidad(clienteId, idSubasta);
            return ResponseEntity.ok(elegibilidad);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            if (e.getMessage().contains("no encontrado")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    /**
     * POST - Unirse a la subasta y obtener acceso a streaming
     * POST /api/subastas/{idSubasta}/unirse
     */
    @PostMapping("/{idSubasta}/unirse")
    public ResponseEntity<?> unirse(
            @PathVariable Integer idSubasta,
            @RequestHeader("Autorizacion") String autorizacion) {
        try {
            Integer clienteId = extraerIdDelToken(autorizacion);
            UnirseResponse respuesta = subastaService.unirseAlStreaming(clienteId, idSubasta);
            return ResponseEntity.ok(respuesta);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            
            if (e.getMessage().contains("no encontrado")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            } else if (e.getMessage().contains("categoría") || e.getMessage().contains("método de pago")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
        }
    }
}
