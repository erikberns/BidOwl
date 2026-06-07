package com.bidowl.auctionplace.service;

import com.bidowl.auctionplace.dto.RegistroPaso1Request;
import com.bidowl.auctionplace.entity.*;
import com.bidowl.auctionplace.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class PersonaService implements PersonaServiceInterface {

    @Autowired
    private PersonaRepository personaRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @Autowired
    private PaisRepository paisRepository;

    @Autowired
    private TarjetaCreditoRepository tarjetaCreditoRepository;

    @Autowired
    private CuentaBancariaRepository cuentaBancariaRepository;

    @Autowired
    private ChequeCertificadoRepository chequeCertificadoRepository;

    @Autowired
    private MetodoPagoRepository metodoPagoRepository;

    @Autowired
    private RegistroPendienteRepository registroPendienteRepository;

    @Autowired
    private EmailService emailService;

    @Override
    public Persona registrarPaso1(RegistroPaso1Request request, MultipartFile fotoDniFrente, MultipartFile fotoDniDorso) throws Exception {
        
        if (request.getNombre() == null || request.getNombre().trim().isEmpty()) {
            throw new Exception("El nombre es obligatorio");
        }
        if (request.getNombre().matches(".*\\d.*")) {
            throw new Exception("El nombre no puede contener números");
        }
        if (request.getApellido() == null || request.getApellido().trim().isEmpty()) {
            throw new Exception("El apellido es obligatorio");
        }
        if (request.getApellido().matches(".*\\d.*")) {
            throw new Exception("El apellido no puede contener números");
        }
        if (request.getDocumento() == null || !request.getDocumento().matches("\\d{8}")) {
            throw new Exception("El DNI debe contener exactamente 8 números");
        }
        if (request.getEmail() == null || !request.getEmail().contains("@")) {
            throw new Exception("Por favor, ingrese un email válido.");
        }

        if (request.getEmail() != null) {
            String trimmedEmail = request.getEmail().trim();
            if (personaRepository.findByEmailIgnoreCase(trimmedEmail).isPresent()) {
                throw new Exception("El email ya se encuentra registrado");
            }
        }

        RegistroPendiente rp = new RegistroPendiente();
        rp.setDocumento(request.getDocumento());
        rp.setNombre(request.getNombre());
        rp.setApellido(request.getApellido());
        rp.setEmail(request.getEmail());
        rp.setDireccion(request.getDomicilio());
        rp.setPais(request.getPais());
        rp.setEstado("PENDIENTE");

        if (fotoDniFrente != null && !fotoDniFrente.isEmpty()) {
            rp.setFotoFrente(fotoDniFrente.getBytes());
        }
        if (fotoDniDorso != null && !fotoDniDorso.isEmpty()) {
            rp.setFotoDorso(fotoDniDorso.getBytes());
        }

        rp = registroPendienteRepository.save(rp);

        Persona transientPersona = new Persona();
        transientPersona.setIdentificador(rp.getId());
        transientPersona.setNombre(rp.getNombre());
        transientPersona.setApellido(rp.getApellido());
        transientPersona.setDireccion(rp.getDireccion());
        transientPersona.setEstado("inactivo");

        return transientPersona;
    }

    @Override
    public Persona completarRegistro(Integer id, String documento, String email, String contrasena) throws Exception {
        RegistroPendiente rp = registroPendienteRepository.findById(id)
                .orElseThrow(() -> new Exception("Registro pendiente no encontrado"));

        if (email != null) {
            String trimmedEmail = email.trim();
            if (personaRepository.findByEmailIgnoreCase(trimmedEmail).isPresent()) {
                throw new Exception("El email ingresado ya está en uso por otra cuenta.");
            }
        }

        rp.setDocumento(documento);
        rp.setEmail(email);
        rp.setEstado("PENDIENTE_APROBACION");

        registroPendienteRepository.save(rp);

        Persona transientPersona = new Persona();
        transientPersona.setIdentificador(rp.getId());
        transientPersona.setDocumento(rp.getDocumento());
        transientPersona.setNombre(rp.getNombre());
        transientPersona.setApellido(rp.getApellido());
        transientPersona.setEmail(rp.getEmail());
        transientPersona.setContrasena(null);
        transientPersona.setDireccion(rp.getDireccion());
        transientPersona.setEstado("inactivo");

        return transientPersona;
    }

    @Override
    public Persona login(String email, String contrasena) throws Exception {
        String trimmedEmail = email.trim();
        Optional<Persona> personaOpt = personaRepository.findByEmailIgnoreCase(trimmedEmail);
        if (personaOpt.isPresent()) {
            Persona persona = personaOpt.get();
            if (!persona.getContrasena().equals(contrasena)) {
                throw new Exception("Credenciales inválidas");
            }
            if (!"activo".equalsIgnoreCase(persona.getEstado())) {
                throw new Exception("Tu cuenta aún no está activa. Debes completar tu registro o esperar la verificación.");
            }
            return persona;
        }

        Optional<RegistroPendiente> rpOpt = registroPendienteRepository.findByEmailIgnoreCase(trimmedEmail);
        if (rpOpt.isPresent()) {
            RegistroPendiente rp = rpOpt.get();
            if ("PENDIENTE".equalsIgnoreCase(rp.getEstado()) || "PENDIENTE_APROBACION".equalsIgnoreCase(rp.getEstado())) {
                throw new Exception("Tu registro está pendiente de aprobación por un administrador.");
            }
            if ("RECHAZADO".equalsIgnoreCase(rp.getEstado())) {
                throw new Exception("Tu solicitud de registro ha sido rechazada por el administrador.");
            }
        }

        throw new Exception("Credenciales inválidas");
    }

    @Override
    public String aprobarRegistro(Integer id) throws Exception {
        return aprobarRegistro(id, "comun");
    }

    @Override
    public String aprobarRegistro(Integer id, String categoria) throws Exception {
        RegistroPendiente rp = registroPendienteRepository.findById(id)
                .orElseThrow(() -> new Exception("Registro pendiente no encontrado"));

        if ("APROBADO".equalsIgnoreCase(rp.getEstado())) {
            throw new Exception("El registro ya ha sido aprobado previamente");
        }

        // La contraseña se genera y se asigna solo tras la validación y aprobación por el administrador
        String contrasenaGenerada = java.util.UUID.randomUUID().toString().substring(0, 8);

        Cliente cliente = new Cliente();
        cliente.setDocumento(rp.getDocumento() != null ? rp.getDocumento() : "DNI-" + id);
        cliente.setNombre(rp.getNombre());
        cliente.setApellido(rp.getApellido());
        cliente.setDireccion(rp.getDireccion());
        cliente.setEstado("activo");
        cliente.setFoto(null); // Foto de perfil se sube en la etapa 2, no se inicializa con la del DNI.
        
        cliente.setFotoFrente(rp.getFotoFrente());
        cliente.setFotoDorso(rp.getFotoDorso());

        cliente.setEmail(rp.getEmail() != null ? rp.getEmail() : "aprobado-" + id + "@bidowl.com");
        cliente.setContrasena(contrasenaGenerada);
        cliente.setContrasenaCambiada(false);
        cliente.setCategoria(categoria);
        cliente.setCategoriaCliente(categoria);
        cliente.setAdmitido("si");

        cliente.setRematesAsistidos(0);
        cliente.setRematesGanados(0);
        cliente.setArticulosPublicados(0);
        cliente.setPujasRealizadas(0);

        if (rp.getPais() != null) {
            List<Pais> paises = paisRepository.findAll();
            Pais paisEncontrado = paises.stream()
                    .filter(p -> p.getNombre().equalsIgnoreCase(rp.getPais()))
                    .findFirst()
                    .orElse(null);
            if (paisEncontrado == null && !paises.isEmpty()) {
                paisEncontrado = paises.get(0);
            }
            cliente.setPais(paisEncontrado);
            cliente.setPaisCliente(paisEncontrado);
        }

        List<Empleado> empleados = empleadoRepository.findAll();
        Empleado verificador = null;
        if (!empleados.isEmpty()) {
            verificador = empleados.get(0);
        } else {
            Empleado mockEmpleado = new Empleado();
            mockEmpleado.setNombre("Sistema");
            mockEmpleado.setApellido("Verificador");
            mockEmpleado.setDocumento("99999999");
            mockEmpleado.setEmail("sistema@bidowl.com");
            mockEmpleado.setContrasena("sistema123");
            mockEmpleado.setCargo("Verificador Automático");
            verificador = personaRepository.save(mockEmpleado);
        }
        cliente.setVerificador(verificador);

        clienteRepository.save(cliente);

        rp.setEstado("APROBADO");
        registroPendienteRepository.save(rp);

        emailService.enviarCredencialesAprobadas(cliente.getEmail(), cliente.getNombre(), contrasenaGenerada);

        return contrasenaGenerada;
    }

    @Override
    public void rechazarRegistro(Integer id, String motivo) throws Exception {
        RegistroPendiente rp = registroPendienteRepository.findById(id)
                .orElseThrow(() -> new Exception("Registro pendiente no encontrado"));

        if ("APROBADO".equalsIgnoreCase(rp.getEstado())) {
            throw new Exception("El registro ya ha sido aprobado previamente");
        }
        if ("RECHAZADO".equalsIgnoreCase(rp.getEstado())) {
            throw new Exception("El registro ya ha sido rechazado previamente");
        }

        rp.setEstado("RECHAZADO");
        registroPendienteRepository.save(rp);

        emailService.enviarRegistroRechazado(rp.getEmail(), rp.getNombre(), motivo);
    }

    @Override
    public List<RegistroPendiente> obtenerRegistrosPendientes() {
        return registroPendienteRepository.findAll();
    }

    @Override
    public Persona obtenerPorId(Integer id) throws Exception {
        return personaRepository.findById(id)
                .orElseThrow(() -> new Exception("Usuario no encontrado"));
    }

    @Override
    public MetodoPago registrarTarjeta(Integer personaId, String numero, String titular, String vencimiento, Integer cvv) throws Exception {
        Persona persona = obtenerPorId(personaId);

        // Verificar si la tarjeta ya existe para este usuario
        List<MetodoPago> metodos = metodoPagoRepository.findByPersonaIdentificador(personaId);
        String cleanNumero = numero.replaceAll("[\\s-]", "");
        for (MetodoPago mp : metodos) {
            if (mp.getTarjetaCredito() != null) {
                String existingClean = mp.getTarjetaCredito().getNumeroTarjeta().replaceAll("[\\s-]", "");
                if (existingClean.equals(cleanNumero)) {
                    throw new Exception("Esta tarjeta de crédito ya se encuentra registrada para este usuario.");
                }
            }
        }

        TarjetaCredito tc = new TarjetaCredito();
        tc.setNumeroTarjeta(numero);
        tc.setTitularTarjeta(titular);
        tc.setFechaVencimiento(vencimiento);
        tc.setCvv(cvv);
        TarjetaCredito tcGuardada = tarjetaCreditoRepository.save(tc);

        MetodoPago mp = new MetodoPago();
        mp.setPersona(persona);
        mp.setTarjetaCredito(tcGuardada);

        return metodoPagoRepository.save(mp);
    }

    @Override
    public MetodoPago registrarCuenta(Integer personaId, String titular, String banco, Integer paisId, String cbu, String moneda, org.springframework.web.multipart.MultipartFile comprobante) throws Exception {
        Persona persona = obtenerPorId(personaId);
        Pais pais = paisRepository.findById(paisId)
                .orElseThrow(() -> new Exception("País no encontrado"));

        // Verificar si el CBU/IBAN ya existe para este usuario
        List<MetodoPago> metodos = metodoPagoRepository.findByPersonaIdentificador(personaId);
        String cleanCbu = cbu.trim();
        for (MetodoPago mp : metodos) {
            if (mp.getCuentaBancaria() != null) {
                if (mp.getCuentaBancaria().getCbuIban().trim().equalsIgnoreCase(cleanCbu)) {
                    throw new Exception("Esta cuenta bancaria ya se encuentra registrada para este usuario.");
                }
            }
        }

        CuentaBancaria cb = new CuentaBancaria();
        cb.setTitularCuenta(titular);
        cb.setNombreBanco(banco);
        cb.setPais(pais);
        cb.setCbuIban(cbu);
        cb.setMoneda(moneda.toLowerCase()); // "pesos" o "dolares"
        
        if (comprobante != null && !comprobante.isEmpty()) {
            cb.setComprobante(comprobante.getBytes());
        }

        CuentaBancaria cbGuardada = cuentaBancariaRepository.save(cb);

        MetodoPago mp = new MetodoPago();
        mp.setPersona(persona);
        mp.setCuentaBancaria(cbGuardada);

        return metodoPagoRepository.save(mp);
    }

    @Override
    public MetodoPago registrarCheque(Integer personaId, String titular, String banco, String numeroCheque, BigDecimal monto, Integer paisId, String moneda, org.springframework.web.multipart.MultipartFile comprobante) throws Exception {
        Persona persona = obtenerPorId(personaId);
        Pais pais = paisRepository.findById(paisId)
                .orElseThrow(() -> new Exception("País no encontrado"));

        // Verificar si el cheque ya existe para este usuario
        List<MetodoPago> metodos = metodoPagoRepository.findByPersonaIdentificador(personaId);
        String cleanNumero = numeroCheque.trim();
        for (MetodoPago mp : metodos) {
            if (mp.getChequeCertificado() != null) {
                if (mp.getChequeCertificado().getNumeroCheque().trim().equalsIgnoreCase(cleanNumero)) {
                    throw new Exception("Este cheque certificado ya se encuentra registrado para este usuario.");
                }
            }
        }

        ChequeCertificado cc = new ChequeCertificado();
        cc.setTitular(titular);
        cc.setBancoEmisor(banco);
        cc.setNumeroCheque(numeroCheque);
        cc.setMonto(monto);
        cc.setPais(pais);
        cc.setMoneda(moneda);

        if (comprobante != null && !comprobante.isEmpty()) {
            cc.setComprobante(comprobante.getBytes());
        }

        ChequeCertificado ccGuardado = chequeCertificadoRepository.save(cc);

        MetodoPago mp = new MetodoPago();
        mp.setPersona(persona);
        mp.setChequeCertificado(ccGuardado);

        return metodoPagoRepository.save(mp);
    }

    @Override
    public boolean requiereConfiguracion(Integer id) throws Exception {
        Persona persona = obtenerPorId(id);
        return persona.getContrasenaCambiada() == null || !persona.getContrasenaCambiada();
    }

    @Override
    public void cambiarContrasena(Integer id, String contrasenaNueva) throws Exception {
        Persona persona = obtenerPorId(id);
        if (contrasenaNueva == null || contrasenaNueva.length() < 8) {
            throw new Exception("La contraseña debe tener al menos 8 caracteres de longitud.");
        }
        if (persona.getContrasena() != null && persona.getContrasena().equals(contrasenaNueva)) {
            throw new Exception("La nueva contraseña no puede ser la misma que la contraseña temporal otorgada.");
        }
        persona.setContrasena(contrasenaNueva);
        persona.setContrasenaCambiada(true);
        personaRepository.save(persona);
    }

    @Override
    public List<Pais> obtenerPaises() throws Exception {
        return paisRepository.findAll();
    }

    @Override
    public void subirFotoPerfil(Integer id, org.springframework.web.multipart.MultipartFile file) throws Exception {
        Persona persona = obtenerPorId(id);
        if (file != null && !file.isEmpty()) {
            persona.setFoto(file.getBytes());
            personaRepository.save(persona);
        }
    }

    @Override
    public boolean existeEmail(String email) throws Exception {
        if (email == null) return false;
        String trimmedEmail = email.trim();
        return personaRepository.findByEmailIgnoreCase(trimmedEmail).isPresent();
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] obtenerFotoPerfilBytes(Integer id) throws Exception {
        Persona persona = obtenerPorId(id);
        return persona.getFoto();
    }

    @Override
    public void recuperarContrasena(String email, String contrasenaNueva) throws Exception {
        if (email == null || email.trim().isEmpty()) {
            throw new Exception("El email es obligatorio.");
        }
        String trimmedEmail = email.trim();
        Persona persona = personaRepository.findByEmailIgnoreCase(trimmedEmail)
                .orElseThrow(() -> new Exception("No se encontró ningún usuario registrado con este email."));

        if (persona.getContrasenaCambiada() == null || !persona.getContrasenaCambiada()) {
            throw new Exception("Debe haber completado la etapa 2 de registro para poder recuperar su contraseña.");
        }
                
        if (contrasenaNueva == null || contrasenaNueva.length() < 8) {
            throw new Exception("La contraseña debe tener al menos 8 caracteres de longitud.");
        }
        
        persona.setContrasena(contrasenaNueva);
        persona.setContrasenaCambiada(true);
        personaRepository.save(persona);
    }

    @Override
    public boolean hasCompletedStage2(String email) throws Exception {
        if (email == null) return false;
        String trimmedEmail = email.trim();
        Optional<Persona> personaOpt = personaRepository.findByEmailIgnoreCase(trimmedEmail);
        if (personaOpt.isPresent()) {
            Persona p = personaOpt.get();
            return p.getContrasenaCambiada() != null && p.getContrasenaCambiada();
        }
        return false;
    }

    @Override
    public List<MetodoPago> obtenerMetodosPago(Integer personaId) throws Exception {
        return metodoPagoRepository.findByPersonaIdentificador(personaId);
    }

    @Override
    public void eliminarMetodoPago(Integer metodoPagoId) throws Exception {
        MetodoPago mp = metodoPagoRepository.findById(metodoPagoId)
                .orElseThrow(() -> new Exception("No se encontró el método de pago."));

        TarjetaCredito tc = mp.getTarjetaCredito();
        CuentaBancaria cb = mp.getCuentaBancaria();
        ChequeCertificado cc = mp.getChequeCertificado();

        metodoPagoRepository.delete(mp);

        if (tc != null) {
            tarjetaCreditoRepository.delete(tc);
        }
        if (cb != null) {
            cuentaBancariaRepository.delete(cb);
        }
        if (cc != null) {
            chequeCertificadoRepository.delete(cc);
        }
    }
}