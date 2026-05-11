package com.bidowl.auctionplace.controllers.usuarios;

import lombok.Data;

@Data
public class UsuarioRequest {
    private String username;
	private String email;
	private String password;
	private String firstName;
	private String lastName;
	private String role;
}
