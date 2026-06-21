package com.bidowl.auctionplace.repository;

import com.bidowl.auctionplace.entity.Asistente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface AsistenteRepository extends JpaRepository<Asistente, Integer> {
    Optional<Asistente> findByClienteIdentificadorAndSubastaIdentificador(Integer clienteId, Integer subastaId);
    List<Asistente> findByClienteIdentificador(Integer clienteId);
    List<Asistente> findBySubastaIdentificador(Integer subastaId);
}
