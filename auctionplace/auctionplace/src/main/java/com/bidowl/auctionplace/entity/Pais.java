// Representa los paises utilizados por personas y medios de pago.
package com.bidowl.auctionplace.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "paises")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pais {

    @Id
    @Column(name = "numero")
    private Integer numero;

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
