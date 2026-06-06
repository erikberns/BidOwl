package com.bidowl.auctionplace.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void enviarTokenVerificacion(String destinatario, String token) throws Exception {
        System.out.println("====================================================================");
        System.out.println("📧 ENVIANDO TOKEN DE VERIFICACIÓN A: " + destinatario);
        System.out.println("Token: " + token);
        System.out.println("====================================================================");

        if (mailSender == null) {
            System.err.println("WARNING: El servicio de envío de correos no está configurado. Simulación exitosa.");
            return;
        }
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(destinatario);
        message.setSubject("BidOwl - Token de Verificación");
        message.setText("Hola,\n\nTu token de verificación para BidOwl es: " + token + "\n\nPor favor, ingrésalo en la aplicación para continuar con el proceso.\n\nSaludos,\nEl equipo de BidOwl");
        
        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("WARNING: Falló el envío de correo SMTP (Authentication/Connection Failed): " + e.getMessage());
            System.err.println("Se continúa utilizando el token simulado en consola.");
        }
    }

    public void enviarCredencialesAprobadas(String destinatario, String nombre, String contrasena) throws Exception {
        System.out.println("====================================================================");
        System.out.println("📧 ENVIANDO CREDENCIALES APROBADAS A: " + destinatario);
        System.out.println("Nombre: " + nombre);
        System.out.println("Contraseña Temporal: " + contrasena);
        System.out.println("====================================================================");

        if (mailSender == null) {
            System.err.println("WARNING: El servicio de envío de correos no está configurado. Simulación exitosa.");
            return;
        }
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(destinatario);
        message.setSubject("¡Tu registro en BidOwl ha sido aprobado!");
        message.setText("Hola " + nombre + ",\n\nTu cuenta ha sido verificada y activada.\n\nPara ingresar, utiliza las siguientes credenciales temporales:\n- Email: " + destinatario + "\n- Contraseña Temporal: " + contrasena + "\n\nSaludos,\nEl equipo de BidOwl");
        
        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("WARNING: Falló el envío de correo de aprobación SMTP: " + e.getMessage());
            System.err.println("Se continúa utilizando las credenciales simuladas en consola.");
        }
    }

    public void enviarRegistroRechazado(String destinatario, String nombre, String motivo) throws Exception {
        System.out.println("====================================================================");
        System.out.println("📧 ENVIANDO REGISTRO RECHAZADO A: " + destinatario);
        System.out.println("Nombre: " + nombre);
        System.out.println("Motivo: " + motivo);
        System.out.println("====================================================================");

        if (mailSender == null) {
            System.err.println("WARNING: El servicio de envío de correos no está configurado. Simulación exitosa.");
            return;
        }
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(destinatario);
        message.setSubject("Tu solicitud de registro en BidOwl ha sido rechazada");
        message.setText("Hola " + nombre + ",\n\nLamentamos informarte que tu solicitud de registro en BidOwl ha sido rechazada.\nMotivo: " + motivo + "\n\nSi crees que esto es un error, por favor ponte en contacto con soporte.\n\nSaludos,\nEl equipo de BidOwl");
        
        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("WARNING: Falló el envío de correo de rechazo SMTP: " + e.getMessage());
            System.err.println("Se continúa utilizando el rechazo simulado en consola.");
        }
    }
}
