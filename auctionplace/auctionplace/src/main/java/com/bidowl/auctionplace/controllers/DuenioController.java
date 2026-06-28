// Expone la creacion del rol de duenio para una persona.
package com.bidowl.auctionplace.controllers;

import com.bidowl.auctionplace.dto.DuenioDTO;
import com.bidowl.auctionplace.service.DuenioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/duenios")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DuenioController {

    @Autowired
    private DuenioService duenioService;

    @PostMapping
    public ResponseEntity<?> crearDuenio(@RequestBody DuenioDTO duenioDTO) {
        try {
            DuenioDTO creado = duenioService.crearDuenio(duenioDTO);
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Dueño creado exitosamente");
            response.put("duenio", creado);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ControllerSupport.errorBody(e.getMessage()));
        }
    }
}
