package com.bidowl.auctionplace.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EstadoItemSubastaDTO {

    private String iditem;
    private PujaLiderDTO pujaLider;
    private Long segundosRestantes;
    private Boolean finalizado;
}
