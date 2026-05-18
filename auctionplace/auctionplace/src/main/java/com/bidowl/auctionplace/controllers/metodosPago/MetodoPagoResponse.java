package com.bidowl.auctionplace.controllers.metodosPago;

import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MetodoPagoResponse {
    
    private UUID idMetodo;
    
    private String tipo;
    
    private String ultimos4;
}
