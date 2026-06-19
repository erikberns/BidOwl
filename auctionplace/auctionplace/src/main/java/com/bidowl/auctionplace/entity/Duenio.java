package com.bidowl.auctionplace.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "duenios")
@PrimaryKeyJoinColumn(name = "identificador")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Duenio extends Cliente {

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "numeroPais")
    private Pais paisDuenio;

    @Column(name = "verificacionFinanciera", length = 2)
    private String verificacionFinanciera = "no"; // "si", "no"

    @Column(name = "verificacionJudicial", length = 2)
    private String verificacionJudicial = "no"; // "si", "no"

    @Column(name = "calificacionRiesgo")
    private Integer calificacionRiesgo = 1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verificador")
    private Empleado verificadorDuenio;
}
