package com.bidowl.auctionplace.repository;

import com.bidowl.auctionplace.entity.Foto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FotoRepository extends JpaRepository<Foto, Integer> {

    @Query("SELECT f FROM Foto f WHERE f.producto.identificador = :productoId")
    List<Foto> findByProductoId(@Param("productoId") Integer productoId);

    @Query("SELECT f FROM Foto f WHERE f.catalogo.identificador = :catalogoId")
    List<Foto> findByCatalogoId(@Param("catalogoId") Integer catalogoId);
}
