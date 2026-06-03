package com.bidowl.auctionplace.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
public class SubastaPublicaDTO {
    private String id;
    private String titulo;
    private String fecha;
    private String categoria;
    private Integer cantidaditems;
    private String imagenPortada;

    public SubastaPublicaDTO(Integer id, String titulo, LocalDate fecha, String categoria, Long cantidaditems, String imagenPortada) {
        this.id = id != null ? id.toString() : null;
        this.titulo = titulo;
        this.fecha = fecha != null ? fecha.toString() : null;
        this.categoria = categoria;
        this.cantidaditems = cantidaditems != null ? cantidaditems.intValue() : 0;
        this.imagenPortada = imagenPortada;
    }
}
