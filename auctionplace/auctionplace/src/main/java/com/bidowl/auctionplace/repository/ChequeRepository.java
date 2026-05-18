package com.bidowl.auctionplace.repository;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import com.bidowl.auctionplace.entity.Cheque;

@Repository
public interface ChequeRepository extends JpaRepository<Cheque, UUID> {

    @Query ("SELECT c FROM Cheque c WHERE c.usuario.id = :usuarioId")
    List<Cheque> findByUsuarioId(UUID usuarioId);
    
}
