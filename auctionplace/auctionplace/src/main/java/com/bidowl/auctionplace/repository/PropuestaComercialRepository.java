package com.bidowl.auctionplace.repository;

import com.bidowl.auctionplace.entity.PropuestaComercial;
import com.bidowl.auctionplace.entity.SolicitudItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PropuestaComercialRepository extends JpaRepository<PropuestaComercial, Integer> {

    Optional<PropuestaComercial> findBySolicitudItem(SolicitudItem solicitudItem);
}
