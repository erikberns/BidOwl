package com.bidowl.auctionplace.entity;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Guarda el limite de compra sin modificar la tabla original de metodos de pago.
@Entity
@Table(name = "limites_metodos_pago")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LimiteMetodoPago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer identificador;

    @JsonIgnore
    @OneToOne
    @JoinColumn(name = "metodo_pago", nullable = false, unique = true)
    private MetodoPago metodoPago;

    @Column(name = "limite_maximo", precision = 18, scale = 0, nullable = false)
    private BigDecimal limiteMaximo;
}
