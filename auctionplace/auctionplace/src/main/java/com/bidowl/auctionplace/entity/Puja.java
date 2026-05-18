package com.bidowl.auctionplace.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "pujos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Puja {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @ManyToOne(optional = false)
    @JoinColumn(name = "asistente", referencedColumnName = "identificador")
    private Asistente asistente;

    @ManyToOne(optional = false)
    @JoinColumn(name = "item", referencedColumnName = "identificador")
    private ItemCatalogo item;

    @Column(name = "importe", precision = 18, scale = 2, nullable = false)
    private BigDecimal importe;

    @Column(name = "ganador", length = 2)
    private String ganador = "no";
}
