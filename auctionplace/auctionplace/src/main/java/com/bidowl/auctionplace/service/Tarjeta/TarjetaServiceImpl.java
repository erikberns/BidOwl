package com.bidowl.auctionplace.service.Tarjeta;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bidowl.auctionplace.repository.TarjetaRepository;
import com.bidowl.auctionplace.entity.Tarjeta;


@Service
public class TarjetaServiceImpl implements TarjetaService {

    @Autowired
    private TarjetaRepository tarjetaRepository;

    @Override
    public List<Tarjeta> getTarjetasByUsuarioId(UUID usuarioId) {
        return tarjetaRepository.findByUsuarioId(usuarioId);
    }

}
