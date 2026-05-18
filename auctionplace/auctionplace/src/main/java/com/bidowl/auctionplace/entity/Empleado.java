package com.bidowl.auctionplace.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "empleados")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Empleado extends Persona {

    @Column(length = 100)
    private String cargo;

    @ManyToOne
    @JoinColumn(name = "sector")
    private Sector sector;
}