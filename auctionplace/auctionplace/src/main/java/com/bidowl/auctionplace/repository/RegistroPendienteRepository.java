package com.bidowl.auctionplace.repository;

import com.bidowl.auctionplace.entity.RegistroPendiente;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RegistroPendienteRepository extends JpaRepository<RegistroPendiente, Integer> {
    Optional<RegistroPendiente> findByEmail(String email);
    Optional<RegistroPendiente> findByDocumento(String documento);
}
