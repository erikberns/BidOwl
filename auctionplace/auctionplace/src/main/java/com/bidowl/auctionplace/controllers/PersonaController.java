package com.bidowl.auctionplace.controllers;

import com.bidowl.auctionplace.dto.RegistroPaso1Request;
import com.bidowl.auctionplace.entity.Persona;
import com.bidowl.auctionplace.service.PersonaServiceInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/personas")
public class PersonaController {

    @Autowired
    private PersonaServiceInterface personaService;

    @PostMapping(value = "/registro/paso1", consumes = {"multipart/form-data"})
    public ResponseEntity<?> registrarPaso1(
            @ModelAttribute RegistroPaso1Request request,
            @RequestParam(value = "fotoFrente", required = false) MultipartFile fotoFrente,
            @RequestParam(value = "fotoDorso", required = false) MultipartFile fotoDorso
    ) {
        Map<String, Object> response = new HashMap<>();
        try {
            Persona guardada = personaService.registrarPaso1(request, fotoFrente, fotoDorso);
            response.put("mensaje", "Paso 1 de registro completado exitosamente.");
            response.put("personaId", guardada.getIdentificador());
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }
}