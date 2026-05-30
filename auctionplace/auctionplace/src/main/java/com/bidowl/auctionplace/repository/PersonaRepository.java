package com.bidowl.auctionplace.repository;

import com.bidowl.auctionplace.entity.Persona;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PersonaRepository extends JpaRepository<Persona, Integer> {
    Optional<Persona> findByEmail(String email);
    Optional<Persona> findByDocumento(String documento);
}