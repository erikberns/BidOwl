package com.bidowl.auctionplace.repository;

import com.bidowl.auctionplace.entity.ItemCatalogo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ItemCatalogoRepository extends JpaRepository<ItemCatalogo, Integer> {
    List<ItemCatalogo> findByCatalogoIdentificador(Integer catalogoId);
    List<ItemCatalogo> findByCatalogoSubastaIdentificador(Integer subastaId);
}
