package com.bidowl.auctionplace.repository;

import com.bidowl.auctionplace.entity.FotoSolicitud;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FotoSolicitudRepository extends JpaRepository<FotoSolicitud, Integer> {

    @Query("SELECT f FROM FotoSolicitud f WHERE f.solicitudItem.id = :solicitudItemId")
    List<FotoSolicitud> findBySolicitudItemId(@Param("solicitudItemId") String solicitudItemId);
}
