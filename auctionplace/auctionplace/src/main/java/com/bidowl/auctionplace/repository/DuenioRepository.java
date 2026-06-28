package com.bidowl.auctionplace.repository;

import com.bidowl.auctionplace.entity.Duenio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface DuenioRepository extends JpaRepository<Duenio, Integer> {
    Optional<Duenio> findByEmailIgnoreCase(String email);
}
