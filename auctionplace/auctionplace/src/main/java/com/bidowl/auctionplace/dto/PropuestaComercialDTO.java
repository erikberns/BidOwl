package com.bidowl.auctionplace.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropuestaComercialDTO {

    private Integer id;
    private BigDecimal valorBase;
    private BigDecimal comision;
    private String estado;
}
