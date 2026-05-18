package com.bidowl.auctionplace.entity;

import jakarta.persistence.MappedSuperclass;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@MappedSuperclass
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MetodoPago {
    private TipoMetodoPago tipo;
    private String detalles;
}
