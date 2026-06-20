package com.bidowl.auctionplace.dto;

import lombok.Data;

@Data
public class ElegibilidadDTO {
    private Boolean puedeUnirse;
    private String motivoRechazo;
    private Boolean yaUnido;
}
