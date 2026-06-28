// Busca medios de pago por persona y valida su pertenencia.
package com.bidowl.auctionplace.repository;

import com.bidowl.auctionplace.entity.MetodoPago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MetodoPagoRepository extends JpaRepository<MetodoPago, Integer> {
    List<MetodoPago> findByPersonaIdentificador(Integer personaId);
    Optional<MetodoPago> findByIdentificadorAndPersonaIdentificador(Integer identificador, Integer personaId);
}
