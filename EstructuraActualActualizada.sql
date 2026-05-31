CREATE DATABASE prueba_aplicaciones;
use prueba_aplicaciones;

create table paises(
	numero int not null,
	nombre varchar(250) not null,
	nombreCorto varchar(250) null,
	capital varchar(250) not null,
	nacionalidad varchar(250) not null,
	idiomas varchar(150) not null,
	constraint pk_paises primary key (numero)
)
go
create table personas(
	identificador int not null identity,
	documento varchar(20) not null,
	nombre varchar(150) not null,
	apellido varchar(150) null,
	numeroPais int null,
	email varchar(250) not null,
	contrasena varchar(255) not null,
	direccion varchar(250) null,
	estado varchar(15) constraint chkEstado_personas check (estado in ('activo', 'inactivo')),
	categoria varchar(10) constraint chkCategoria_personas check (categoria in ('comun', 'plata', 'oro', 'platino', 'especial')),
	foto varbinary(max) null,
	metodoPago int null,
	rematesAsistidos int not null default 0,
	rematesGanados int not null default 0,
	articulosPublicados int not null default 0,
	pujasRealizadas int not null default 0,
	constraint pk_personas primary key (identificador),
	constraint fk_personas_paises foreign key (numeroPais) references paises (numero),
	constraint uq_personas_email unique (email)
)
go
create table empleados(
	identificador int not null,
	cargo varchar(100),
	sector int null,
	constraint pk_empleados primary key (identificador)
)
go

create table sectores(
	identificador int not null identity,
	nombreSector varchar(150) not null,
	codigoSector varchar(10) null,
	responsableSector int null,
	constraint pk_sectores primary key (identificador),
	constraint fk_sectores_empleados foreign key (responsableSector) references empleados
)
go

create table seguros(
	-- ver de agregar una seccion de seguros al ser aceptada el producto.
	nroPoliza varchar(30) not null,
	compania varchar(150) not null,
	polizaCombinada varchar(2) constraint chkpolizaCombinada check(polizaCombinada in ('si','no')),
	importe decimal(18,2) not null constraint chkImporte check (importe > 0),
	constraint pk_seguro primary key (nroPoliza)
)
go
	
create table clientes(
	identificador int not null,
	numeroPais int,
	admitido varchar(2) constraint chkAdmitido check(admitido in ('si','no')),
	categoria varchar(10) constraint chkCategoria check (categoria in ('comun', 'especial', 'plata', 'oro', 'platino')),
	verificador int not null,
	constraint pk_clientes primary key (identificador),
	constraint fk_clientes_personas foreign key (identificador) references personas,
	constraint fk_clientes_empleados foreign key (verificador) references empleados (identificador),
	constraint fk_clientes_paises foreign key (numeroPais) references paises (numero)
)
go

create table duenios(
	identificador int not null,
	numeroPais int,
	verificacionFinanciera varchar(2) constraint chkVF check(verificacionFinanciera in ('si','no')),
	verificacionJudicial varchar(2) constraint chkVJ check(verificacionJudicial in ('si','no')),
	calificacionRiesgo int constraint chkCR check(calificacionRiesgo in (1,2,3,4,5,6)),
	verificador int not null,
	constraint pk_duenios primary key (identificador),
	constraint fk_duenios_personas foreign key (identificador) references personas,
	constraint fk_duenios_empleados foreign key (verificador) references empleados (identificador)
)
go

create table subastadores(
	identificador int not null,
	matricula varchar(15),
	region varchar(50),
	constraint pk_subastadores primary key (identificador),
	constraint fk_subastadores_personas foreign key (identificador) references personas
)
go

create table subastas(
	identificador int not null identity,
	--las subastas tiene al menos 10 dias de anticipaci�n al momento de crearlas.
	fecha date constraint chkFecha check (fecha > dateAdd(dd, 10, getdate())),
	hora time not null,
	estado varchar(10) constraint chkES check (estado in ('abierta','cerrada')),
	subastador int null,
	--direccion de don de se desarrolla el evento.
	ubicacion varchar(350) null,
	capacidadAsistentes int null,
	--caracteristica del lugar donde se hacen las subastas
	tieneDeposito varchar(2) constraint chkTD check(tieneDeposito in ('si','no')),
	--caracteristica del lugar donde se hacen las subastas
	seguridadPropia varchar(2) constraint chkSP check(seguridadPropia in ('si','no')),
	categoria varchar(10) constraint chkCS check (categoria in ('comun', 'especial', 'plata', 'oro', 'platino')),
	constraint pk_subastas primary key (identificador),
	constraint fk_subastas_subastadores foreign key (subastador) references subastadores(identificador)
)
go
create table productos(
	identificador int not null identity,
	fecha date,
	disponible varchar(2) constraint chkD check (disponible in ('si','no')),
	--se obtiene despues que un empleado realiza la revision.
	descripcionCatalogo varchar(500) null default 'No Posee',
	--url que apunta a un documento PDF firmado que contiene la descripci�n del producto.
	descripcionCompleta varchar(300) not null,
	revisor int not null,
	duenio int not null,
	seguro varchar(30) null,
	constraint pk_productos primary key (identificador),
	constraint fk_productos_empleados foreign key (revisor) references empleados(identificador),
	constraint fk_productos_duenios foreign key (duenio) references duenios(identificador),
	constraint fk_productos_seguros foreign key (seguro) references seguros(nroPoliza)
)
go
create table fotos(
	identificador int not null identity,
	producto int not null,
	foto varbinary (max) not null,
	constraint pk_fotos primary key (identificador),
	constraint fk_fotos_productos foreign key (producto) references productos(identificador)
)
go

create table catalogos(
	identificador int not null identity,
	descripcion varchar(250) not null,
	subasta int null,
	responsable int not null,
	constraint pk_catalogos primary key (identificador),
	constraint fk_catalogos_empleados foreign key (responsable) references empleados(identificador),
	constraint fk_catalogos_subastas foreign key (subasta) references subastas(identificador)
)
go

create table itemsCatalogo(
	identificador int not null identity,
	catalogo int not null,
	producto int not null,
	precioBase decimal(18,2) not null constraint chkPB check (precioBase > 0.01),
	comision decimal(18,2) not null constraint chkC check (comision > 0.01),
	subastado varchar(2) constraint chkS check (subastado in ('si','no')),
	constraint pk_itemsCatalogo primary key (identificador),
	constraint fk_itemsCatalogo_catalogos foreign key (catalogo) references catalogos,
	constraint fk_itemsCatalogo_productos foreign key (producto) references productos
)
go

create table asistentes(
	identificador int not null identity,
	numeroPostor int not null,
	cliente int not null,
	subasta int not null,
	constraint pk_asistentes primary key (identificador),
	constraint fk_asistentes_clientes foreign key (cliente) references clientes,
	constraint fk_asistentes_subasta foreign key (subasta) references subastas
)
go

create table pujos(
	-- esta bien
	identificador int not null identity,
	asistente int not null,
	item int not null,
	importe decimal(18,2) not null constraint chkI check (importe > 0.01),
	ganador varchar(2) constraint chkG check (ganador in ('si','no')) default 'no',
	constraint pk_pujos primary key (identificador),
	constraint fk_pujos_asistentes foreign key (asistente) references asistentes,
	constraint fk_pujos_itemsCatalogo foreign key (item) references itemsCatalogo
)
go

create table chequeCertificado(
    identificador int not null identity,
    titular varchar(250) not null,
    bancoEmisor varchar(250) not null,
    numeroCheque varchar(50) not null,
    monto decimal(18,2) not null constraint chk_cheque_monto check (monto > 0),
    pais int null,
    moneda varchar(10) null, -- hacerlo enumerate a pesos o dolares
    comprobante varbinary(max) null,
    constraint pk_chequeCertificado primary key (identificador),
    constraint fk_chequeCertificado_paises foreign key (pais) references paises(numero)
)
go

create table cuentaBancaria(
	identificador int not null identity,
	titularCuenta varchar(250) not null,
	nombreBanco varchar(250) not null,
	pais int not null,
	moneda varchar(10) not null constraint chkMoneda_cuentaBancaria check (moneda in ('pesos', 'dolares')),
	cbuIban varchar(50) not null,
	comprobante varbinary(max) null,
	constraint pk_cuentaBancaria primary key (identificador),
	constraint fk_cuentaBancaria_paises foreign key (pais) references paises(numero)
)
go

create table tarjetaCredito(
	identificador int not null identity,
	numeroTarjeta varchar(20) not null,
	titularTarjeta varchar(250) not null,
	fechaVencimiento varchar(5) not null, -- formato MM/AA
	cvv int not null constraint chkCVV_tarjetaCredito check (cvv >= 100 and cvv <= 9999),
	constraint pk_tarjetaCredito primary key (identificador)
)
go

create table metodoPago(
	identificador int not null identity,
	persona int not null,
	chequeCertificado int null,
	cuentaBancaria int null,
	tarjetaCredito int null,
	constraint pk_metodoPago primary key (identificador),
	constraint fk_metodoPago_personas foreign key (persona) references personas(identificador),
	constraint fk_metodoPago_cheque foreign key (chequeCertificado) references chequeCertificado(identificador),
	constraint fk_metodoPago_cuenta foreign key (cuentaBancaria) references cuentaBancaria(identificador),
	constraint fk_metodoPago_tarjeta foreign key (tarjetaCredito) references tarjetaCredito(identificador)
)
go

create table registroDeSubasta(
	identificador int not null identity,
	subasta int not null,
	duenio int not null,
	producto int not null,
	cliente int not null,
	metodoPago int not null,
	importe decimal(18,2) not null constraint chkImportePagado check (importe > 0.01),
	comision decimal(18,2) not null constraint chkComisionPagada check (comision > 0.01),		
	constraint pk_registroDeSubasta primary key (identificador),
	constraint fk_registroDeSubasta_subastas foreign key (subasta) references subastas,
	constraint fk_registroDeSubasta_duenios foreign key (duenio) references duenios,
	constraint fk_registroDeSubasta_producto foreign key (producto) references productos,
	constraint fk_registroDeSubasta_cliente foreign key (cliente) references clientes,
	constraint fk_registroDeSubasta_metodoPago foreign key (metodoPago) references metodoPago(identificador)
)
go

