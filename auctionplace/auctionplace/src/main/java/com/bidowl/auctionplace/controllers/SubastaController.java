package com.bidowl.auctionplace.controllers;

import com.bidowl.auctionplace.entity.Subasta;
import com.bidowl.auctionplace.entity.ItemCatalogo;
import com.bidowl.auctionplace.entity.Asistente;
import com.bidowl.auctionplace.service.SubastaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
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
}
