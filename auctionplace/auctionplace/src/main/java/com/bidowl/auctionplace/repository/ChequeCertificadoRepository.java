package com.bidowl.auctionplace.repository;

import com.bidowl.auctionplace.entity.ChequeCertificado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChequeCertificadoRepository extends JpaRepository<ChequeCertificado, Integer> {
}
