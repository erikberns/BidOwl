package com.bidowl.auctionplace.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bidowl.auctionplace.entity.ChequeCertificadoCompromiso;

@Repository
public interface ChequeCertificadoCompromisoRepository extends JpaRepository<ChequeCertificadoCompromiso, Integer> {

    @Query("SELECT COALESCE(SUM(c.monto), 0) FROM ChequeCertificadoCompromiso c "
            + "WHERE c.chequeCertificado.identificador = :chequeId "
            + "AND c.estado = 'ACTIVO' "
            + "AND (:itemId IS NULL OR c.item.identificador <> :itemId)")
    BigDecimal sumMontoActivoByChequeExcluyendoItem(
            @Param("chequeId") Integer chequeId,
            @Param("itemId") Integer itemId);

    List<ChequeCertificadoCompromiso> findByItemIdentificadorAndEstado(Integer itemId, String estado);

    Optional<ChequeCertificadoCompromiso> findByPujoIdentificadorAndEstado(Integer pujoId, String estado);
}
