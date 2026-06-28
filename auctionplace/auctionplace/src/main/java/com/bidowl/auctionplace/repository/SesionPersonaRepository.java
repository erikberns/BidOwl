// Resuelve sesiones persistidas a partir de su token.
package com.bidowl.auctionplace.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bidowl.auctionplace.entity.SesionPersona;

@Repository
public interface SesionPersonaRepository extends JpaRepository<SesionPersona, Integer> {
    Optional<SesionPersona> findByTokenAndActivaTrue(String token);
}
