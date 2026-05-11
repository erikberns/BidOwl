package com.bidowl.auctionplace.controllers.usuarios;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UsuarioResponse {
    private Long id;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private boolean isActive;
    private LocalDateTime createdAt;
}
