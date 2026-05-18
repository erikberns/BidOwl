package com.bidowl.auctionplace.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@Entity
@Table(name = "paises")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class Pais {

    @Id
    @Column(name = "numero")
    private int numero;

    @Column(name = "nombre", length = 250, nullable = false)
    private String nombre;

    @Column(name = "nombreCorto", length = 250)
    private String nombreCorto;

    @Column(name = "capital", length = 250, nullable = false)
    private String capital;

    @Column(name = "nacionalidad", length = 250, nullable = false)
    private String nacionalidad;

    @Column(name = "idiomas", length = 150, nullable = false)
    private String idiomas;

}
