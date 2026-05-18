package com.bidowl.auctionplace.controllers.cheques;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cheques")
public class ChequeController {
    
    @GetMapping
    public void obtenerCheques() {
    }
    
    @GetMapping("/{id}")
    public void obtenerChequePorId(@PathVariable String id) {
    }
    
    @PostMapping
    public void crearCheque(@RequestBody ChequeRequest request) {
    }
    
    @PutMapping("/{id}")
    public void actualizarCheque(@PathVariable String id, @RequestBody ChequeRequest request) {
    }
    
    @DeleteMapping("/{id}")
    public void eliminarCheque(@PathVariable String id) {
    }
}
