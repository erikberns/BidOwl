package com.bidowl.auctionplace.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class WonItemDetailDTO {
    private Integer itemId;
    private String subastaTitle;
    private String itemTitle;
    private Integer loteIndex;
    private Integer totalLotes;
    private BigDecimal importe;
    private String domicilio;
    private BigDecimal costoEnvio;
    private String tipoEntrega;
}
