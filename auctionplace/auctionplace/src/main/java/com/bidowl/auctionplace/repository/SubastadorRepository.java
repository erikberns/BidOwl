package com.bidowl.auctionplace.repository;

import com.bidowl.auctionplace.entity.Subastador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubastadorRepository extends JpaRepository<Subastador, Integer> {
}
