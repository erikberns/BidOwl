// Consulta la propuesta comercial asociada a cada producto.
package com.bidowl.auctionplace.repository;

import com.bidowl.auctionplace.entity.PropuestaComercial;
import com.bidowl.auctionplace.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PropuestaComercialRepository extends JpaRepository<PropuestaComercial, Integer> {

    Optional<PropuestaComercial> findByProducto(Producto producto);
    Optional<PropuestaComercial> findByProductoIdentificador(Integer productoId);
}
