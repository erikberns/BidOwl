package com.bidowl.auctionplace.service.Tarjeta;

import java.util.List;
import java.util.UUID;
import com.bidowl.auctionplace.entity.Tarjeta;

public interface TarjetaService {

    List<Tarjeta> getTarjetasByUsuarioId(UUID usuarioId);

}
