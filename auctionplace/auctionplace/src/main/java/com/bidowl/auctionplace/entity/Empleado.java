package com.bidowl.auctionplace.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "empleados")
@PrimaryKeyJoinColumn(name = "identificador")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Empleado extends Persona {

    @Column(name = "cargo", length = 100)
    private String cargo;

    @Column(name = "sector")
    private Integer sector;
}
