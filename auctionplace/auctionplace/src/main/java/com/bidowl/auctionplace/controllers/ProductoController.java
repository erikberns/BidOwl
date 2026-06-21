package com.bidowl.auctionplace.controllers;

import com.bidowl.auctionplace.dto.ProductoDTO;
import com.bidowl.auctionplace.service.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    /**
     * GET - Obtiene todos los productos
     * GET /api/v1/productos
     */
    @GetMapping
    public ResponseEntity<?> obtenerTodos() {
        try {
            List<ProductoDTO> productos = productoService.obtenerTodos();
            return ResponseEntity.ok(productos);
        } catch (Exception e) {
            return crearRespuestaError("Error al obtener productos: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET - Obtiene un producto por ID
     * GET /api/v1/productos/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Integer id) {
        try {
            ProductoDTO producto = productoService.obtenerPorId(id);
            return ResponseEntity.ok(producto);
        } catch (Exception e) {
            return crearRespuestaError(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    /**
     * GET - Obtiene todos los productos disponibles
     * GET /api/v1/productos/disponibles
     */
    @GetMapping("/disponibles/lista")
    public ResponseEntity<?> obtenerDisponibles() {
        try {
            List<ProductoDTO> productos = productoService.obtenerDisponibles();
            return ResponseEntity.ok(productos);
        } catch (Exception e) {
            return crearRespuestaError("Error al obtener productos disponibles: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET - Obtiene todos los productos de un dueño
     * GET /api/v1/productos/duenio/{duenioId}
     */
    @GetMapping("/duenio/{duenioId}")
    public ResponseEntity<?> obtenerPorDuenio(@PathVariable Integer duenioId) {
        try {
            List<ProductoDTO> productos = productoService.obtenerPorDuenio(duenioId);
            return ResponseEntity.ok(productos);
        } catch (Exception e) {
            return crearRespuestaError(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    /**
     * POST - Crea un nuevo producto
     * POST /api/v1/productos
     */
    @PostMapping
    public ResponseEntity<?> crearProducto(@RequestBody ProductoDTO productoDTO) {
        try {
            ProductoDTO nuevoProducto = productoService.crearProducto(productoDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoProducto);
        } catch (Exception e) {
            return crearRespuestaError("Error al crear producto: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * PUT - Actualiza un producto existente
     * PUT /api/v1/productos/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarProducto(@PathVariable Integer id, @RequestBody ProductoDTO productoDTO) {
        try {
            ProductoDTO productoActualizado = productoService.actualizarProducto(id, productoDTO);
            return ResponseEntity.ok(productoActualizado);
        } catch (Exception e) {
            return crearRespuestaError(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    /**
     * DELETE - Elimina un producto
     * DELETE /api/v1/productos/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarProducto(@PathVariable Integer id) {
        try {
            productoService.eliminarProducto(id);
            Map<String, String> respuesta = new HashMap<>();
            respuesta.put("mensaje", "Producto eliminado correctamente");
            respuesta.put("id", id.toString());
            return ResponseEntity.ok(respuesta);
        } catch (Exception e) {
            return crearRespuestaError(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    /**
     * PATCH - Acepta el producto en la inspección
     * PATCH /api/productos/{id}/aceptar
     */
    @PatchMapping("/{id}/aceptar")
    public ResponseEntity<?> marcarComoDisponible(
            @PathVariable Integer id,
            @RequestBody(required = false) Map<String, String> body) {
        try {
            String descripcionCatalogo = null;
            if (body != null) {
                descripcionCatalogo = body.get("descripcionCatalogo");
                if (descripcionCatalogo == null) {
                    descripcionCatalogo = body.get("motivo");
                }
            }
            ProductoDTO producto = productoService.marcarComoDisponible(id, descripcionCatalogo);
            return ResponseEntity.ok(producto);
        } catch (Exception e) {
            return crearRespuestaError(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    /**
     * PATCH - Rechaza el producto en la inspección
     * PATCH /api/productos/{id}/rechazar
     */
    @PatchMapping("/{id}/rechazar")
    public ResponseEntity<?> marcarComoNoDisponible(
            @PathVariable Integer id,
            @RequestBody(required = false) Map<String, String> body) {
        try {
            String descripcionCatalogo = null;
            if (body != null) {
                descripcionCatalogo = body.get("descripcionCatalogo");
                if (descripcionCatalogo == null) {
                    descripcionCatalogo = body.get("motivo");
                }
            }
            ProductoDTO producto = productoService.marcarComoNoDisponible(id, descripcionCatalogo);
            return ResponseEntity.ok(producto);
        } catch (Exception e) {
            return crearRespuestaError(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/{id}/foto")
    public ResponseEntity<byte[]> obtenerFotoProducto(@PathVariable Integer id) {
        try {
            byte[] foto = productoService.obtenerPrimerFotoBytes(id);
            if (foto == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.IMAGE_JPEG)
                    .body(foto);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/seguro")
    public ResponseEntity<?> obtenerSeguroProducto(@PathVariable Integer id) {
        try {
            Map<String, Object> seguro = productoService.obtenerSeguroProducto(id);
            return ResponseEntity.ok(seguro);
        } catch (Exception e) {
            return crearRespuestaError(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/{id}/fotos")
    public ResponseEntity<?> obtenerIdsFotosProducto(@PathVariable Integer id) {
        try {
            List<Integer> ids = productoService.obtenerIdsFotosProducto(id);
            List<String> urls = ids.stream()
                    .map(fotoId -> "/api/productos/fotos/" + fotoId)
                    .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(urls);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/fotos/{fotoId}")
    public ResponseEntity<byte[]> obtenerFotoPorId(@PathVariable Integer fotoId) {
        try {
            byte[] foto = productoService.obtenerFotoBytesPorId(fotoId);
            if (foto == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.IMAGE_JPEG)
                    .body(foto);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Método auxiliar para crear respuestas de error consistentes
     */
    private ResponseEntity<?> crearRespuestaError(String mensaje, HttpStatus status) {
        Map<String, String> error = new HashMap<>();
        error.put("error", mensaje);
        error.put("estado", status.toString());
        return ResponseEntity.status(status).body(error);
    }
}
