package com.bidowl.auctionplace.repository;

import java.util.Optional;

import com.bidowl.auctionplace.entity.ChequeCertificado;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Repository;

@Repository
public interface ChequeCertificadoRepository extends JpaRepository<ChequeCertificado, Integer> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<ChequeCertificado> findByIdentificador(Integer identificador);
}
