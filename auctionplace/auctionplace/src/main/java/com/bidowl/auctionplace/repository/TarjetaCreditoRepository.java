package com.bidowl.auctionplace.repository;

import com.bidowl.auctionplace.entity.TarjetaCredito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TarjetaCreditoRepository extends JpaRepository<TarjetaCredito, Integer> {
}
