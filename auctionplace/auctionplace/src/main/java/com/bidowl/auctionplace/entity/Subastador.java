package com.bidowl.auctionplace.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "subastadores")
@PrimaryKeyJoinColumn(name = "identificador")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Subastador extends Persona {

    @Column(name = "matricula", length = 15)
    private String matricula;

    @Column(name = "region", length = 50)
    private String region;
}
