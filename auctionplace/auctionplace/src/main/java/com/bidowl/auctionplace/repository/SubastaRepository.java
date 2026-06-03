package com.bidowl.auctionplace.repository;

import com.bidowl.auctionplace.entity.Subasta;
import com.bidowl.auctionplace.dto.SubastaPublicaDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SubastaRepository extends JpaRepository<Subasta, Integer> {
    List<Subasta> findByEstado(String estado);

    @Query("SELECT new com.bidowl.auctionplace.dto.SubastaPublicaDTO(" +
           "  s.identificador, " +
           "  concat('Subasta ', s.identificador), " +
           "  s.fecha, " +
           "  s.categoria, " +
           "  (SELECT count(i) FROM ItemCatalogo i WHERE i.catalogo.subasta = s), " +
           "  concat('https://via.placeholder.com/200x150?text=Subasta', s.identificador)" +
           ") FROM Subasta s " +
           "WHERE (:estado IS NULL OR s.estado = :estado) " +
           "AND (:categoria IS NULL OR s.categoria = :categoria)")
    Page<SubastaPublicaDTO> findCatalogoPublico(
            @Param("estado") String estado, 
            @Param("categoria") String categoria, 
            Pageable pageable);
}
