// Consulta registros de adjudicacion por producto, comprador o vendedor.
package com.bidowl.auctionplace.repository;

import com.bidowl.auctionplace.entity.RegistroDeSubasta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RegistroDeSubastaRepository extends JpaRepository<RegistroDeSubasta, Integer> {
    List<RegistroDeSubasta> findByClienteIdentificador(Integer clienteId);
    Optional<RegistroDeSubasta> findFirstByProductoIdentificadorOrderByIdentificadorDesc(Integer productoId);
}
