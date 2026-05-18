package com.bidowl.auctionplace.controllers.usuarios;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bidowl.auctionplace.controllers.metodosPago.MetodoPagoResponse;
import com.bidowl.auctionplace.controllers.tarjetas.TarjetaRequest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {
    
    private final UsuarioService usuarioService;
    
    @PostMapping("/{idUsuario}/metodos-pago/tarjeta")
    public ResponseEntity<MetodoPagoResponse> agregarTarjeta(
            @PathVariable UUID idUsuario,
            @Valid @RequestBody TarjetaRequest request) {
        
        MetodoPagoResponse response = usuarioService.agregarTarjeta(idUsuario, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
