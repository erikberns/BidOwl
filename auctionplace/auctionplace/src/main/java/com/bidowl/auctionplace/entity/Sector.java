// Representa un sector interno y su empleado responsable.
package com.bidowl.auctionplace.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "sectores")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Sector {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @Column(name = "nombreSector", length = 150, nullable = false)
    private String nombreSector;

    @Column(name = "codigoSector", length = 10)
    private String codigoSector;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsableSector")
    private Empleado responsableSector;
}
