// Modela una cuenta bancaria y su moneda para pagos o cobros.
package com.bidowl.auctionplace.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "cuentaBancaria")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CuentaBancaria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Integer identificador;

    @Column(name = "titularCuenta", length = 250, nullable = false)
    private String titularCuenta;

    @Column(name = "nombreBanco", length = 250, nullable = false)
    private String nombreBanco;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "pais", nullable = false)
    private Pais pais;

    @Column(name = "moneda", length = 10, nullable = false)
    private String moneda; // "pesos", "dolares"

    @Column(name = "cbuIban", length = 50, nullable = false)
    private String cbuIban;
}
