package com.bidowl.auctionplace.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductoDTO {

    private Integer identificador;
    private LocalDate fecha;
    private String disponible;
    private String descripcionCatalogo;
    private String descripcionCompleta;
    private Integer revisorId;
    private String revisorNombre;
    private Integer duenioId;
    private String duenioNombre;
    private String seguroNumeroPoliza;
    private String nombre;
    private String descripcion;
}
