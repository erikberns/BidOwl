package com.bidowl.auctionplace.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bidowl.auctionplace.entity.ClienteDeudaSubasta;

@Repository
public interface ClienteDeudaSubastaRepository extends JpaRepository<ClienteDeudaSubasta, Integer> {
    List<ClienteDeudaSubasta> findByClienteIdentificadorAndEstado(Integer clienteId, String estado);
    Optional<ClienteDeudaSubasta> findFirstByClienteIdentificadorAndEstadoOrderByFechaGeneracionDesc(Integer clienteId, String estado);
    Optional<ClienteDeudaSubasta> findByRegistroSubastaIdentificadorAndEstado(Integer registroId, String estado);
    Optional<ClienteDeudaSubasta> findFirstByRegistroSubastaProductoIdentificadorAndEstado(Integer productoId, String estado);
}
