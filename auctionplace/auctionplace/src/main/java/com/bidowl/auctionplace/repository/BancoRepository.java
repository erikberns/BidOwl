package com.bidowl.auctionplace.repository;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import com.bidowl.auctionplace.entity.Banco;

public interface BancoRepository extends JpaRepository<Banco, UUID> {

    @Query ("SELECT b FROM Banco b WHERE b.usuario.id = :usuarioId")
    List<Banco> findByUsuarioId(UUID usuarioId);
    
}
