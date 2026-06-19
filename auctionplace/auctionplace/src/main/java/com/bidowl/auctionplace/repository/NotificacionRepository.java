package com.bidowl.auctionplace.repository;

import com.bidowl.auctionplace.entity.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, Integer> {
    List<Notificacion> findByPersonaIdOrderByFechaDesc(Integer personaId);
}
