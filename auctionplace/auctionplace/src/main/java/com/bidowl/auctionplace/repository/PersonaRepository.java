// Busca personas y empleados por identificador, correo o documento.
package com.bidowl.auctionplace.repository;

import com.bidowl.auctionplace.entity.Persona;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PersonaRepository extends JpaRepository<Persona, Integer> {
    Optional<Persona> findByEmail(String email);
    Optional<Persona> findByEmailIgnoreCase(String email);
    Optional<Persona> findByDocumento(String documento);

    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true)
    @org.springframework.data.jpa.repository.Query(value = "UPDATE personas_estadisticas SET articulosPublicados = COALESCE(articulosPublicados, 0) + 1 WHERE identificador = :id", nativeQuery = true)
    void incrementarArticulosPublicados(@org.springframework.data.repository.query.Param("id") Integer id);
}
