package com.bidowl.auctionplace.repository;

import com.bidowl.auctionplace.entity.SolicitudItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SolicitudItemRepository extends JpaRepository<SolicitudItem, String> {

    @Query("SELECT s FROM SolicitudItem s WHERE s.creador.identificador = :creadorId ORDER BY s.fechaCreacionSolicitud DESC")
    List<SolicitudItem> findByCreadorId(@Param("creadorId") Integer creadorId);

    @Query("SELECT s FROM SolicitudItem s WHERE s.creador.identificador = :creadorId AND s.estado IN ('ACEPTADO_INSPECCION', 'PROPUESTA', 'ACEPTADO') ORDER BY s.fechaActualizacion DESC")
    List<SolicitudItem> findItemsActivosByCreador(@Param("creadorId") Integer creadorId);

    @Query("SELECT s FROM SolicitudItem s WHERE s.estado = :estado ORDER BY s.fechaCreacionSolicitud DESC")
    List<SolicitudItem> findByEstado(@Param("estado") String estado);

    Optional<SolicitudItem> findById(String id);
}
