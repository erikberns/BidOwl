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
            return ResponseEntity.badRequest().body(ControllerSupport.errorBody(e.getMessage()));
        } catch (Exception e) {
            return ControllerSupport.errorResponse("Error interno del servidor: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping(value = "/{id}/foto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> subirFotosCatalogo(
            @PathVariable Integer id,
            @RequestParam("foto") MultipartFile[] fotos) {
        try {
            if (fotos == null || fotos.length == 0 || (fotos.length == 1 && fotos[0].isEmpty())) {
                return ResponseEntity.badRequest().body(ControllerSupport.errorBody("Al menos un archivo de foto es requerido."));
            }
            
            java.util.List<byte[]> fotosBytes = new java.util.ArrayList<>();
            for (MultipartFile file : fotos) {
                if (!file.isEmpty()) {
                    fotosBytes.add(file.getBytes());
                }
            }

            if (fotosBytes.isEmpty()) {
                return ResponseEntity.badRequest().body(ControllerSupport.errorBody("Los archivos proporcionados están vacíos."));
            }

            catalogoService.guardarFotosCatalogo(id, fotosBytes);
            
            Map<String, Object> response = new HashMap<>();
            response.put("identificador", id);
            response.put("mensaje", "Fotos subidas con éxito. Cantidad: " + fotosBytes.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            if (e instanceof java.util.NoSuchElementException) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ControllerSupport.errorBody(e.getMessage()));
            }
            return ResponseEntity.badRequest().body(ControllerSupport.errorBody(e.getMessage()));
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
