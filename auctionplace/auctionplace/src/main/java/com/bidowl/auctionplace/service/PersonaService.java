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

@Service
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

    @Override
    public Persona registrarPaso1(RegistroPaso1Request request, MultipartFile fotoDniFrente, MultipartFile fotoDniDorso) throws Exception {
        
        if (request.getEmail() != null) {
            if (personaRepository.findByEmail(request.getEmail()).isPresent() ||
                registroPendienteRepository.findByEmail(request.getEmail()).isPresent()) {
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
            if (personaRepository.findByEmail(email).isPresent()) {
                throw new Exception("El email ingresado ya está en uso por otra cuenta.");
            }
            Optional<RegistroPendiente> existente = registroPendienteRepository.findByEmail(email);
            if (existente.isPresent() && !existente.get().getId().equals(id)) {
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
        Optional<Persona> personaOpt = personaRepository.findByEmail(email);
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

        Optional<RegistroPendiente> rpOpt = registroPendienteRepository.findByEmail(email);
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
        cliente.setFoto(rp.getFotoFrente());
        
        cliente.setFotoFrente(rp.getFotoFrente());
        cliente.setFotoDorso(rp.getFotoDorso());

        cliente.setEmail(rp.getEmail() != null ? rp.getEmail() : "aprobado-" + id + "@bidowl.com");
        cliente.setContrasena(contrasenaGenerada);
        cliente.setContrasenaCambiada(false);
        cliente.setCategoria("comun");
        cliente.setCategoriaCliente("comun");
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

        // Simulación de envío de correo en consola para depuración
        System.out.println("====================================================================");
        System.out.println("📧 CORREO SIMULADO ENVIADO A: " + cliente.getEmail());
        System.out.println("Asunto: ¡Tu registro en BidOwl ha sido aprobado!");
        System.out.println("Contenido: Hola " + cliente.getNombre() + ", tu cuenta ha sido verificada y activada.");
        System.out.println("Para ingresar, utiliza las siguientes credenciales temporales:");
        System.out.println("   - Email: " + cliente.getEmail());
        System.out.println("   - Contraseña Temporal: " + contrasenaGenerada);
        System.out.println("====================================================================");

        return contrasenaGenerada;
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
    public MetodoPago registrarCuenta(Integer personaId, String titular, String banco, Integer paisId, String cbu, String moneda) throws Exception {
        Persona persona = obtenerPorId(personaId);
        Pais pais = paisRepository.findById(paisId)
                .orElseThrow(() -> new Exception("País no encontrado"));

        CuentaBancaria cb = new CuentaBancaria();
        cb.setTitularCuenta(titular);
        cb.setNombreBanco(banco);
        cb.setPais(pais);
        cb.setCbuIban(cbu);
        cb.setMoneda(moneda.toLowerCase()); // "pesos" o "dolares"
        CuentaBancaria cbGuardada = cuentaBancariaRepository.save(cb);

        MetodoPago mp = new MetodoPago();
        mp.setPersona(persona);
        mp.setCuentaBancaria(cbGuardada);

        return metodoPagoRepository.save(mp);
    }

    @Override
    public MetodoPago registrarCheque(Integer personaId, String titular, String banco, String numeroCheque, BigDecimal monto, Integer paisId, String moneda) throws Exception {
        Persona persona = obtenerPorId(personaId);
        Pais pais = paisRepository.findById(paisId)
                .orElseThrow(() -> new Exception("País no encontrado"));

        ChequeCertificado cc = new ChequeCertificado();
        cc.setTitular(titular);
        cc.setBancoEmisor(banco);
        cc.setNumeroCheque(numeroCheque);
        cc.setMonto(monto);
        cc.setPais(pais);
        cc.setMoneda(moneda);
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
}