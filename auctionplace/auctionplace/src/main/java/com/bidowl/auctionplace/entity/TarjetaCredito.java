package com.bidowl.auctionplace.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "tarjetaCredito")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TarjetaCredito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @Column(name = "numeroTarjeta", length = 20, nullable = false)
    private String numeroTarjeta;

    @Column(name = "titularTarjeta", length = 250, nullable = false)
    private String titularTarjeta;

    @Column(name = "fechaVencimiento", length = 5, nullable = false)
    private String fechaVencimiento;

    @Column(name = "cvv", nullable = false)
    private Integer cvv;
}
