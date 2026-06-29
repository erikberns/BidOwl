package com.bidowl.auctionplace.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bidowl.auctionplace.entity.LimiteMetodoPago;

public interface LimiteMetodoPagoRepository extends JpaRepository<LimiteMetodoPago, Integer> {
    Optional<LimiteMetodoPago> findByMetodoPagoIdentificador(Integer metodoPagoId);
}
