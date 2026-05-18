package com.bidowl.auctionplace.controllers.tarjeta;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bidowl.auctionplace.entity.Tarjeta;

@Repository
public interface TarjetaRepository extends JpaRepository<Tarjeta, UUID> {
}
