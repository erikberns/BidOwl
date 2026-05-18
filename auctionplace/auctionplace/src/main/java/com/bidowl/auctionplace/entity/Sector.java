package com.bidowl.auctionplace.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sectores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Sector {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer identificador;

    @Column(nullable = false, length = 150)
    private String nombreSector;

    @Column(length = 10)
    private String codigoSector;

    @ManyToOne
    @JoinColumn(name = "responsableSector")
    private Empleado responsableSector;
}