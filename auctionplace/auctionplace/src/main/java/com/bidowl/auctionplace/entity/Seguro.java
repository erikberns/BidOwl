// Representa la poliza y cobertura contratada para uno o varios bienes.
package com.bidowl.auctionplace.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "seguros")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Seguro {

    @Id
    @Column(name = "nroPoliza", length = 30)
    private String nroPoliza;

    @Column(name = "compania", length = 150, nullable = false)
    private String compania;

    @Column(name = "polizaCombinada", length = 2)
    private String polizaCombinada = "no"; // "si", "no"

    @Column(name = "importe", precision = 18, scale = 2, nullable = false)
    private BigDecimal importe;
}
