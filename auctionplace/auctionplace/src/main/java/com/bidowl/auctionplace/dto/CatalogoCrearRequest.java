package com.bidowl.auctionplace.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CatalogoCrearRequest {
    private String descripcion;
    private Integer responsableId;
    private List<ItemCatalogoCrearRequest> items;
}
