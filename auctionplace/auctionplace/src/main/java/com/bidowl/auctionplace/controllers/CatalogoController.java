package com.bidowl.auctionplace.controllers;

import com.bidowl.auctionplace.dto.*;
import com.bidowl.auctionplace.entity.Catalogo;
import com.bidowl.auctionplace.service.CatalogoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/catalogos")
@CrossOrigin(origins = "*")
public class CatalogoController {

    @Autowired
    private CatalogoService catalogoService;

    @PostMapping
    public ResponseEntity<?> crearCatalogo(@RequestBody CatalogoCrearRequest request) {
        try {
            Catalogo catalogo = catalogoService.crearCatalogo(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(catalogo);
        } catch (IllegalArgumentException | IllegalStateException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Error interno del servidor: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping(value = "/{id}/foto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> subirFotosCatalogo(
            @PathVariable Integer id,
            @RequestParam("foto") MultipartFile[] fotos) {
        try {
            if (fotos == null || fotos.length == 0 || (fotos.length == 1 && fotos[0].isEmpty())) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Al menos un archivo de foto es requerido.");
                return ResponseEntity.badRequest().body(error);
            }
            
            java.util.List<byte[]> fotosBytes = new java.util.ArrayList<>();
            for (MultipartFile file : fotos) {
                if (!file.isEmpty()) {
                    fotosBytes.add(file.getBytes());
                }
            }

            if (fotosBytes.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Los archivos proporcionados están vacíos.");
                return ResponseEntity.badRequest().body(error);
            }

            catalogoService.guardarFotosCatalogo(id, fotosBytes);
            
            Map<String, Object> response = new HashMap<>();
            response.put("identificador", id);
            response.put("mensaje", "Fotos subidas con éxito. Cantidad: " + fotosBytes.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            if (e instanceof java.util.NoSuchElementException) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/{id}/foto")
    public ResponseEntity<byte[]> obtenerFotoCatalogo(@PathVariable Integer id) {
        try {
            byte[] foto = catalogoService.obtenerFotoCatalogoBytes(id);
            if (foto == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(foto);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
