package com.bidowl.auctionplace.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "subastadores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Subastador extends Persona {

    @Column(length = 15)
    private String matricula;

    @Column(length = 50)
    private String region;
}