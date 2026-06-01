package com.bidowl.auctionplace.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudItemDetalleDTO {

    private String id;
    private String estado;
    private String motivoRechazo;
    private LocalDate fechaCreacion;
    private String nombre;
    private String descripcion;
    private String historia;
    private String ubicacionDeposito;
    private String polizaSeguro;
    private PropuestaComercialDTO propuesta;
    private BigDecimal costoDevolucion;
}
