package com.bidowl.auctionplace.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemCatalogoCrearRequest {
    private Integer productoId;
    private BigDecimal precioBase; // Opcional (si es nulo, usa valorBase de la propuesta)
    private BigDecimal comision;   // Opcional (si es nulo, usa comision de la propuesta)
    private String fechaFinPuja;   // Opcional (yyyy-MM-dd HH:mm:ss)
}
