package com.bidowl.auctionplace.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "subastas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Subasta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @Column(name = "fecha")
    private LocalDate fecha;

    @Column(name = "hora", nullable = false)
    private LocalTime hora;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", length = 10)
    private EstadoSubasta estado;

    @ManyToOne
    @JoinColumn(name = "subastador", referencedColumnName = "identificador")
    private Subastador subastador;

    @Column(name = "ubicacion", length = 350)
    private String ubicacion;

    @Column(name = "capacidadAsistentes")
    private Integer capacidadAsistentes;

    @Enumerated(EnumType.STRING)
    @Column(name = "tieneDeposito", length = 2)
    private SiNo tieneDeposito;

    @Enumerated(EnumType.STRING)
    @Column(name = "seguridadPropia", length = 2)
    private SiNo seguridadPropia;

    @Enumerated(EnumType.STRING)
    @Column(name = "categoria", length = 10)
    private CategoriaSubasta categoria;
}