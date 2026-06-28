// Convierte las categorias de clientes y subastas en niveles comparables.
package com.bidowl.auctionplace.service;

import org.springframework.stereotype.Service;

@Service
public class CategoryRankService {

    public int getRank(String categoria) {
        if (categoria == null) {
            return 0;
        }
        switch (categoria.toLowerCase()) {
            case "comun":
                return 1;
            case "especial":
                return 2;
            case "plata":
                return 3;
            case "oro":
                return 4;
            case "platino":
                return 5;
            default:
                return 0;
        }
    }
}
