package com.bidowl.auctionplace.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
public class SubastaPublicaDTO {
    private String id;
    private String titulo;
    private String fecha;
    private String hora;
    private String ubicacion;
    private String categoria;
    private Integer cantidaditems;
    private String imagenPortada;
    private String estado;

    public SubastaPublicaDTO(Integer id, String titulo, LocalDate fecha, LocalTime hora, String ubicacion, String categoria, Long cantidaditems, String imagenPortada, String estado) {
        this.id = id != null ? id.toString() : null;
        this.titulo = titulo;
        this.fecha = fecha != null ? fecha.toString() : null;
        this.hora = hora != null ? hora.toString() : null;
        this.ubicacion = ubicacion;
        this.categoria = categoria;
        this.cantidaditems = cantidaditems != null ? cantidaditems.intValue() : 0;
        this.imagenPortada = imagenPortada;
        this.estado = estado;
    }
}
