package com.bidowl.auctionplace.controllers.tarjetas;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tarjetas")
public class TarjetaController {
    
    @GetMapping
    public void obtenerTarjetas() {
    }
    
    @GetMapping("/{id}")
    public void obtenerTarjetaPorId(@PathVariable String id) {
    }
    
    @PostMapping
    public void crearTarjeta(@RequestBody TarjetaRequest request) {
    }
    
    @PutMapping("/{id}")
    public void actualizarTarjeta(@PathVariable String id, @RequestBody TarjetaRequest request) {
    }
    
    @DeleteMapping("/{id}")
    public void eliminarTarjeta(@PathVariable String id) {
    }
}
