package com.bidowl.auctionplace.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "seguros")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Seguro {

    @Id
    private String nroPoliza;

    @Column(nullable = false, length = 150)
    private String compania;

    @Enumerated(EnumType.STRING)
    @Column(length = 2)
    private SiNo polizaCombinada;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal importe;
}