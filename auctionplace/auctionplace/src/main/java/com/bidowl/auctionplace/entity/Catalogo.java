package com.bidowl.auctionplace.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "catalogos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Catalogo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer identificador;

    @Column(nullable = false, length = 250)
    private String descripcion;

    @ManyToOne
    @JoinColumn(name = "subasta")
    private Subasta subasta;

    @ManyToOne(optional = false)
    @JoinColumn(name = "responsable")
    private Empleado responsable;
}