package com.bidowl.auctionplace.repository;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import com.bidowl.auctionplace.entity.Tarjeta;

@Repository
public interface TarjetaRepository extends JpaRepository<Tarjeta, UUID> {
}
