package com.bidowl.auctionplace.repository;

import com.bidowl.auctionplace.entity.ItemCatalogo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ItemCatalogoRepository extends JpaRepository<ItemCatalogo, Integer> {
    List<ItemCatalogo> findByCatalogoIdentificador(Integer catalogoId);
    List<ItemCatalogo> findByCatalogoSubastaIdentificador(Integer subastaId);
    List<ItemCatalogo> findByProductoIdentificador(Integer productoId);

    /**
     * Encuentra un ItemCatalogo por su ID y el ID de la subasta a la que pertenece.
     * Spring Data JPA deriva la consulta de la navegación de propiedades:
     * ItemCatalogo -> catalogo -> subasta -> identificador
     */
    Optional<ItemCatalogo> findByIdentificadorAndCatalogo_Subasta_Identificador(Integer identificador, Integer subastaIdentificador);

    boolean existsByIdentificadorAndCatalogo_Subasta_Identificador(Integer identificador, Integer subastaIdentificador);
}
