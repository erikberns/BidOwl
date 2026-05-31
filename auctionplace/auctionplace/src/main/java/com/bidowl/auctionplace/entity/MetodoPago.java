package com.bidowl.auctionplace.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "metodoPago")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MetodoPago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "persona", nullable = false)
    private Persona persona;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "chequeCertificado")
    private ChequeCertificado chequeCertificado;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cuentaBancaria")
    private CuentaBancaria cuentaBancaria;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tarjetaCredito")
    private TarjetaCredito tarjetaCredito;
}
