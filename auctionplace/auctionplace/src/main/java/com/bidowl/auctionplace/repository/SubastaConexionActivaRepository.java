// Consulta y elimina el registro de conexion activa de cada usuario.
package com.bidowl.auctionplace.repository;

import com.bidowl.auctionplace.entity.SubastaConexionActiva;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubastaConexionActivaRepository extends JpaRepository<SubastaConexionActiva, Integer> {
    Optional<SubastaConexionActiva> findFirstByPersonaIdentificadorAndActivaTrueOrderByFechaActualizacionDesc(Integer personaId);
    Optional<SubastaConexionActiva> findFirstByPersonaIdentificadorAndSubastaIdentificadorAndActivaTrue(
            Integer personaId,
            Integer subastaId);
}
