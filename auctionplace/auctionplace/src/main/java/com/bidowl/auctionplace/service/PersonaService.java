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

    @Override
    public Persona registrarPaso1(RegistroPaso1Request request, MultipartFile fotoDniFrente, MultipartFile fotoDniDorso) throws Exception {
        
        if (request.getEmail() != null && personaRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new Exception("El email ya se encuentra registrado");
        }

        // Creamos un Cliente (ya que los postores que se registran son Clientes)
        Cliente nuevoCliente = new Cliente();
        
        // Cargar campos requeridos provisionales para evitar constraints de SQL
        nuevoCliente.setDocumento(request.getDocumento() != null ? request.getDocumento() : "PENDIENTE-" + System.currentTimeMillis());
        nuevoCliente.setEmail(request.getEmail() != null ? request.getEmail() : "pendiente-" + System.currentTimeMillis() + "@test.com");
        nuevoCliente.setContrasena(request.getContrasena() != null ? request.getContrasena() : "PENDIENTE");

        // Datos del Paso 1
        nuevoCliente.setNombre(request.getNombre());
        nuevoCliente.setApellido(request.getApellido());
        nuevoCliente.setDireccion(request.getDomicilio());
        nuevoCliente.setEstado("inactivo"); // Inactivo hasta que complete paso 2 y sea verificado
        nuevoCliente.setCategoria("comun"); // Categoría base
        nuevoCliente.setCategoriaCliente("comun");
        nuevoCliente.setAdmitido("no");

        // Asignar País
        if (request.getPais() != null) {
            // Intentar buscar país por nombre
            List<Pais> paises = paisRepository.findAll();
            Pais paisEncontrado = paises.stream()
                    .filter(p -> p.getNombre().equalsIgnoreCase(request.getPais()))
                    .findFirst()
                    .orElse(null);
            
            if (paisEncontrado == null && !paises.isEmpty()) {
                paisEncontrado = paises.get(0); // fallback
            }
            nuevoCliente.setPais(paisEncontrado);
            nuevoCliente.setPaisCliente(paisEncontrado);
        }

        // Asignar un verificador por defecto (Empleado) para evitar violación de FK no nula en SQL
        List<Empleado> empleados = empleadoRepository.findAll();
        Empleado verificador = null;
        if (!empleados.isEmpty()) {
            verificador = empleados.get(0);
        } else {
            // Si no hay empleados, creamos uno mock para que la FK funcione
            Empleado mockEmpleado = new Empleado();
            mockEmpleado.setNombre("Sistema");
            mockEmpleado.setApellido("Verificador");
            mockEmpleado.setDocumento("99999999");
            mockEmpleado.setEmail("sistema@bidowl.com");
            mockEmpleado.setContrasena("sistema123");
            mockEmpleado.setCargo("Verificador Automático");
            verificador = personaRepository.save(mockEmpleado);
        }
        nuevoCliente.setVerificador(verificador);

        // Guardar foto frente como array de bytes en la persona
        if (fotoDniFrente != null && !fotoDniFrente.isEmpty()) {
            nuevoCliente.setFoto(fotoDniFrente.getBytes());
        }

        return clienteRepository.save(nuevoCliente);
    }

    @Override
    public Persona completarRegistro(Integer id, String documento, String email, String contrasena) throws Exception {
        Persona persona = personaRepository.findById(id)
                .orElseThrow(() -> new Exception("Usuario no encontrado"));

        if (personaRepository.findByEmail(email).isPresent() && !persona.getEmail().equalsIgnoreCase(email)) {
            throw new Exception("El email ingresado ya está en uso por otra cuenta.");
        }

        persona.setDocumento(documento);
        persona.setEmail(email);
        persona.setContrasena(contrasena);
        persona.setEstado("activo"); // Activamos al completar el registro

        if (persona instanceof Cliente) {
            Cliente c = (Cliente) persona;
            c.setAdmitido("si");
            return clienteRepository.save(c);
        }

        return personaRepository.save(persona);
    }

    @Override
    public Persona login(String email, String contrasena) throws Exception {
        Persona persona = personaRepository.findByEmail(email)
                .orElseThrow(() -> new Exception("Credenciales inválidas"));

        if (!persona.getContrasena().equals(contrasena)) {
            throw new Exception("Credenciales inválidas");
        }

        if (!"activo".equalsIgnoreCase(persona.getEstado())) {
            throw new Exception("Tu cuenta aún no está activa. Debes completar tu registro o esperar la verificación.");
        }

        return persona;
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
}