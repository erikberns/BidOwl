package com.bidowl.auctionplace.controllers.tarjetas;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TarjetaResponse {
    
    private UUID id;
    private String numeroTarjeta;
    private String titularTarjeta;
    private String fechaVencimiento;
    private String cvv;
    private String usuarioId;
    private String mensaje;
}
