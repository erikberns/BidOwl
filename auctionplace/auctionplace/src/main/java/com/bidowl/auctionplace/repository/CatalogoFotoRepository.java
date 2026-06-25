package com.bidowl.auctionplace.repository;

import com.bidowl.auctionplace.entity.CatalogoFoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CatalogoFotoRepository extends JpaRepository<CatalogoFoto, Integer> {

    @Query("SELECT f FROM CatalogoFoto f WHERE f.catalogo.identificador = :catalogoId")
    List<CatalogoFoto> findByCatalogoId(@Param("catalogoId") Integer catalogoId);
}
