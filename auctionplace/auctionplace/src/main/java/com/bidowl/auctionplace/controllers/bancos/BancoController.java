package com.bidowl.auctionplace.controllers.bancos;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bancos")
public class BancoController {
    
    @GetMapping
    public void obtenerBancos() {
    }
    
    @GetMapping("/{id}")
    public void obtenerBancoPorId(@PathVariable String id) {
    }
    
    @PostMapping
    public void crearBanco(@RequestBody BancoRequest request) {
    }
    
    @PutMapping("/{id}")
    public void actualizarBanco(@PathVariable String id, @RequestBody BancoRequest request) {
    }
    
    @DeleteMapping("/{id}")
    public void eliminarBanco(@PathVariable String id) {
    }
}
