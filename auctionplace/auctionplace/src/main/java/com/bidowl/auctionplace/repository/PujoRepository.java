package com.bidowl.auctionplace.repository;

import com.bidowl.auctionplace.entity.Pujo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PujoRepository extends JpaRepository<Pujo, Integer> {
    List<Pujo> findByItemIdentificadorOrderByImporteDesc(Integer itemId);
    Optional<Pujo> findFirstByItemIdentificadorOrderByImporteDesc(Integer itemId);
    List<Pujo> findByAsistenteClienteIdentificador(Integer clienteId);
    
    @Query("SELECT p FROM Pujo p WHERE p.item.identificador = :itemId ORDER BY p.importe DESC")
    List<Pujo> findPujasByItem(@Param("itemId") Integer itemId);
}
