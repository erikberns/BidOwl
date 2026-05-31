package com.bidowl.auctionplace.repository;

import com.bidowl.auctionplace.entity.Catalogo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CatalogoRepository extends JpaRepository<Catalogo, Integer> {
    Optional<Catalogo> findBySubastaIdentificador(Integer subastaId);
}
