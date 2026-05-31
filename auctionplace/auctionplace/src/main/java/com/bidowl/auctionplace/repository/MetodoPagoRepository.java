package com.bidowl.auctionplace.repository;

import com.bidowl.auctionplace.entity.MetodoPago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MetodoPagoRepository extends JpaRepository<MetodoPago, Integer> {
    List<MetodoPago> findByPersonaIdentificador(Integer personaId);
}
