package com.bidowl.auctionplace.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Servicio encargado de gestionar el envío de notificaciones y tokens por
 * correo electrónico.
 * Utiliza la API HTTP REST de Brevo para evadir bloqueos de puertos SMTP en la
 * nube.
 */
@Service
public class EmailService {

    @Value("${BREVO_API_KEY:}")
    private String apiKey;

    @Value("${spring.mail.username:info@bidowl.com}")
    private String remitente;

    private final RestTemplate restTemplate = new RestTemplate();
    private final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    private void enviarPorHttp(String destinatario, String asunto, String texto) {
        if (apiKey == null || apiKey.isEmpty()) {
            System.err.println("WARNING: BREVO_API_KEY no configurada. Simulación en consola exitosa.");
            return;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", apiKey);
            headers.set("accept", "application/json");

            Map<String, Object> body = new HashMap<>();

            Map<String, String> sender = new HashMap<>();
            sender.put("email", remitente);
            sender.put("name", "BidOwl");
            body.put("sender", sender);

            Map<String, String> to = new HashMap<>();
            to.put("email", destinatario);
            body.put("to", List.of(to));

            body.put("subject", asunto);
            body.put("textContent", texto);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.exchange(BREVO_API_URL, HttpMethod.POST, request,
                    String.class);

            System.out.println("✅ Correo enviado con éxito vía HTTP API. Estado: " + response.getStatusCode());

        } catch (Exception e) {
            System.err.println("❌ Error enviando correo vía HTTP API: " + e.getMessage());
        }
    }

    @Async
    public void enviarTokenVerificacion(String destinatario, String token) {
        System.out.println("====================================================================");
        System.out.println("📧 ENVIANDO TOKEN A: " + destinatario);
        System.out.println("Token: " + token);
        System.out.println("====================================================================");

        String asunto = "BidOwl - Token de Verificación";
        String texto = "Hola,\n\nTu token de verificación para BidOwl es: " + token
                + "\n\nPor favor, ingrésalo en la aplicación para continuar con el proceso.\n\nSaludos,\nEl equipo de BidOwl";

        enviarPorHttp(destinatario, asunto, texto);
    }

    @Async
    public void enviarCredencialesAprobadas(String destinatario, String nombre, String contrasena) {
        System.out.println("====================================================================");
        System.out.println("📧 ENVIANDO CREDENCIALES APROBADAS A: " + destinatario);
        System.out.println("Nombre: " + nombre);
        System.out.println("Contraseña Temporal: " + contrasena);
        System.out.println("====================================================================");

        String asunto = "¡Tu registro en BidOwl ha sido aprobado!";
        String texto = "Hola " + nombre
                + ",\n\nTu cuenta ha sido verificada y activada.\n\nPara ingresar, utiliza las siguientes credenciales temporales:\n- Email: "
                + destinatario + "\n- Contraseña Temporal: " + contrasena + "\n\nSaludos,\nEl equipo de BidOwl";

        enviarPorHttp(destinatario, asunto, texto);
    }

    @Async
    public void enviarRegistroRechazado(String destinatario, String nombre, String motivo) {
        System.out.println("====================================================================");
        System.out.println("📧 ENVIANDO REGISTRO RECHAZADO A: " + destinatario);
        System.out.println("Nombre: " + nombre);
        System.out.println("Motivo: " + motivo);
        System.out.println("====================================================================");

        String asunto = "Tu solicitud de registro en BidOwl ha sido rechazada";
        String texto = "Hola " + nombre
                + ",\n\nLamentamos informarte que tu solicitud de registro en BidOwl ha sido rechazada.\nMotivo: "
                + motivo
                + "\n\nSi crees que esto es un error, por favor ponte en contacto con soporte.\n\nSaludos,\nEl equipo de BidOwl";

        enviarPorHttp(destinatario, asunto, texto);
    }

    @Async
    public void enviarEmailNegociacionSeguro(String destinatario, String productoNombre, String nroPoliza) {
        System.out.println("====================================================================");
        System.out.println("📧 ENVIANDO EMAIL DE NEGOCIACIÓN DE SEGURO A: " + destinatario);
        System.out.println("Producto: " + productoNombre);
        System.out.println("Nro Póliza: " + nroPoliza);
        System.out.println("====================================================================");

        String asunto = "Negociación de seguro para tu artículo: " + productoNombre;
        String texto = "Hola,\n\nTe informamos que se ha iniciado el proceso de negociación del seguro para tu artículo \""
                + productoNombre + "\".\nNúmero de Póliza: " + nroPoliza
                + "\nPor favor contacte este número para continuar la negociación: +54 11 9999-9999.\n\\nSaludos,\nEl equipo de BidOwl";

        enviarPorHttp(destinatario, asunto, texto);
    }
}
