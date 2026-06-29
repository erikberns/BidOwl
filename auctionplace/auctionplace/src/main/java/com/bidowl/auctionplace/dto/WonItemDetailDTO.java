package com.bidowl.auctionplace.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class WonItemDetailDTO {
    private Integer itemId;
    private String subastaTitle;
    private String itemTitle;
    private String image;
    private Integer loteIndex;
    private Integer totalLotes;
    private BigDecimal importe;
    private String moneda;
    private String domicilio;
    private BigDecimal costoEnvio;
    private String tipoEntrega;
    private String estadoPago;
    private BigDecimal montoPagado;
    private BigDecimal limiteMetodoPago;
    private String fechaIntentoPago;
    private Boolean bloqueadoPorDeuda;
    private String deudaEstado;
    private BigDecimal montoMulta;
    private BigDecimal montoTotalDeuda;
    private String fechaVencimientoDeuda;
}
