package com.bidowl.auctionplace.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "clientes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Cliente extends Persona {

    private Integer numeroPais;

    @Enumerated(EnumType.STRING)
    @Column(length = 2)
    private SiNo admitido;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private categoria categoria;

    @ManyToOne(optional = false)
    @JoinColumn(name = "verificador")
    private Empleado verificador;
}