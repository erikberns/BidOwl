package com.bidowl.auctionplace.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;

import org.springframework.stereotype.Service;

@Service
public class RelativeTimeService {

    private static final ZoneId ARGENTINA_ZONE = ZoneId.of("America/Argentina/Buenos_Aires");

    public String describe(LocalDateTime dateTime) {
        if (dateTime == null) {
            return "N/A";
        }

        Duration duration = Duration.between(dateTime, LocalDateTime.now(ARGENTINA_ZONE));
        long seconds = duration.getSeconds();
        if (seconds < 0) {
            return "hace unos segundos";
        }
        if (seconds < 60) {
            return "hace " + seconds + (seconds == 1 ? " segundo" : " segundos");
        }

        long minutes = duration.toMinutes();
        if (minutes < 60) {
            return "hace " + minutes + (minutes == 1 ? " minuto" : " minutos");
        }

        long hours = duration.toHours();
        if (hours < 24) {
            return "hace " + hours + (hours == 1 ? " hora" : " horas");
        }

        long days = duration.toDays();
        if (days < 30) {
            return "hace " + days + (days == 1 ? " día" : " días");
        }

        long months = days / 30;
        return "hace " + months + (months == 1 ? " mes" : " meses");
    }
}
