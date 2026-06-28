// Envia tokens, credenciales, rechazos y avisos mediante Brevo o correo SMTP.
package com.bidowl.auctionplace.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Value("${spring.mail.username:info@bidowl.com}")
    private String remitente;

    @Value("${brevo.api-key:}")
    private String brevoApiKey;

    @Value("${brevo.api-url:https://api.brevo.com/v3/smtp/email}")
    private String brevoApiUrl;

    @Value("${brevo.sender-email:info@bidowl.com}")
    private String brevoSenderEmail;

    @Value("${brevo.sender-name:BidOwl}")
    private String brevoSenderName;

    @Autowired
    private JavaMailSender mailSender;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    private void enviarEmail(String destinatario, String asunto, String texto) {
        if (brevoApiKey != null && !brevoApiKey.isBlank()) {
            enviarPorBrevo(destinatario, asunto, texto);
            return;
        }
        enviarPorSmtp(destinatario, asunto, texto);
    }

    private void enviarPorBrevo(String destinatario, String asunto, String texto) {
        try {
            String body = "{"
                    + "\"sender\":{\"name\":\"" + escapeJson(brevoSenderName) + "\",\"email\":\"" + escapeJson(brevoSenderEmail) + "\"},"
                    + "\"to\":[{\"email\":\"" + escapeJson(destinatario) + "\"}],"
                    + "\"subject\":\"" + escapeJson(asunto) + "\","
                    + "\"textContent\":\"" + escapeJson(texto) + "\""
                    + "}";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(brevoApiUrl))
                    .header("accept", "application/json")
                    .header("api-key", brevoApiKey)
                    .header("content-type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                System.out.println("Correo enviado con exito via Brevo a: " + destinatario);
            } else {
                System.err.println("Error enviando correo via Brevo a " + destinatario
                        + ". Status: " + response.statusCode() + ". Body: " + response.body());
            }
        } catch (Exception e) {
            System.err.println("Error enviando correo via Brevo a " + destinatario + ": " + e.getMessage());
        }
    }

    private void enviarPorSmtp(String destinatario, String asunto, String texto) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(remitente);
            message.setTo(destinatario);
            message.setSubject(asunto);
            message.setText(texto);
            mailSender.send(message);
            System.out.println("Correo enviado con exito via SMTP a: " + destinatario);
        } catch (Exception e) {
            System.err.println("Error enviando correo via SMTP a " + destinatario + ": " + e.getMessage());
        }
    }

    private String escapeJson(String value) {
        if (value == null) {
            return "";
        }
        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\b", "\\b")
                .replace("\f", "\\f")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    @Async
    public void enviarTokenVerificacion(String destinatario, String token) {
        System.out.println("====================================================================");
        System.out.println("ENVIANDO TOKEN A: " + destinatario);
        System.out.println("Token: " + token);
        System.out.println("====================================================================");

        String asunto = "BidOwl - Token de Verificacion";
        String texto = "Hola,\n\nTu token de verificacion para BidOwl es: " + token
                + "\n\nPor favor, ingresalo en la aplicacion para continuar con el proceso.\n\nSaludos,\nEl equipo de BidOwl";

        enviarEmail(destinatario, asunto, texto);
    }

    @Async
    public void enviarCredencialesAprobadas(String destinatario, String nombre, String contrasena) {
        System.out.println("====================================================================");
        System.out.println("ENVIANDO CREDENCIALES APROBADAS A: " + destinatario);
        System.out.println("Nombre: " + nombre);
        System.out.println("Contrasena Temporal: " + contrasena);
        System.out.println("====================================================================");

        String asunto = "Tu registro en BidOwl ha sido aprobado";
        String texto = "Hola " + nombre
                + ",\n\nTu cuenta ha sido verificada y activada.\n\nPara ingresar, utiliza las siguientes credenciales temporales:\n- Email: "
                + destinatario + "\n- Contrasena Temporal: " + contrasena + "\n\nSaludos,\nEl equipo de BidOwl";

        enviarEmail(destinatario, asunto, texto);
    }

    @Async
    public void enviarRegistroRechazado(String destinatario, String nombre, String motivo) {
        System.out.println("====================================================================");
        System.out.println("ENVIANDO REGISTRO RECHAZADO A: " + destinatario);
        System.out.println("Nombre: " + nombre);
        System.out.println("Motivo: " + motivo);
        System.out.println("====================================================================");

        String asunto = "Tu solicitud de registro en BidOwl ha sido rechazada";
        String texto = "Hola " + nombre
                + ",\n\nLamentamos informarte que tu solicitud de registro en BidOwl ha sido rechazada.\nMotivo: "
                + motivo
                + "\n\nSi crees que esto es un error, por favor ponte en contacto con soporte.\n\nSaludos,\nEl equipo de BidOwl";

        enviarEmail(destinatario, asunto, texto);
    }

    @Async
    public void enviarEmailNegociacionSeguro(String destinatario, String productoNombre, String nroPoliza) {
        System.out.println("====================================================================");
        System.out.println("ENVIANDO EMAIL DE NEGOCIACION DE SEGURO A: " + destinatario);
        System.out.println("Producto: " + productoNombre);
        System.out.println("Nro Poliza: " + nroPoliza);
        System.out.println("====================================================================");

        String asunto = "Negociacion de seguro para tu articulo: " + productoNombre;
        String texto = "Hola,\n\nTe informamos que se ha iniciado el proceso de negociacion del seguro para tu articulo \""
                + productoNombre + "\".\nNumero de poliza: " + nroPoliza
                + "\nPor favor contacte este numero para continuar la negociacion: +54 11 9999-9999.\n\nSaludos,\nEl equipo de BidOwl";

        enviarEmail(destinatario, asunto, texto);
    }
}
