package com.bidowl.auctionplace.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "asistentes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Asistente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer identificador;

    private Integer numeroPostor;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cliente")
    private Cliente cliente;

    @ManyToOne(optional = false)
    @JoinColumn(name = "subasta")
    private Subasta subasta;
}