package com.bidowl.auctionplace.controllers.usuarios;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bidowl.auctionplace.entity.User;

@Repository
public interface UsuarioRepository extends JpaRepository<User, UUID> {
}
