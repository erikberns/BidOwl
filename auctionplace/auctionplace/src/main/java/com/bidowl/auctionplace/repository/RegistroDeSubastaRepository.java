package com.bidowl.auctionplace.repository;

import com.bidowl.auctionplace.entity.RegistroDeSubasta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RegistroDeSubastaRepository extends JpaRepository<RegistroDeSubasta, Integer> {
    List<RegistroDeSubasta> findByClienteIdentificador(Integer clienteId);
}
