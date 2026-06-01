package com.bidowl.auctionplace.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HistorialPujaDTO {

    private String idpersona;
    private String nombre;
    private BigDecimal monto;
    private String hace; // Ej: "hace 5 minutos", "hace 2 horas"
}
