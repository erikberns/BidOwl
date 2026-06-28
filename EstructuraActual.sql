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
	direccion varchar(250),
	estado varchar(15) constraint chkEstado check (estado in ('activo', 'incativo')),
	foto varbinary(max)
	constraint pk_personas primary key (identificador)
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
	verificaciónFinanciera varchar(2) constraint chkVF check(verificaciónFinanciera in ('si','no')),
	verificaciónJudicial varchar(2) constraint chkVJ check(verificaciónJudicial in ('si','no')),
	calificacionRiesgo int constraint chkCR check(calificacionRiesgo in (1,2,3,4,5,6)),
	verificador int not null
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
	--las subastas tiene al menos 10 dias de anticipación al momento de crearlas.
	fecha date constraint chkFecha check (fecha > dateAdd(dd, 10, getdate())),
	hora time not null,
	estado varchar(10) constraint chkES check (estado in ('abierta','carrada')),
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
	--url que apunta a un documento PDF firmado que contiene la descripción del producto.
	descripcionCompleta varchar(300) not null,
	revisor int not null,
	duenio int not null,
	seguro varchar(30) null,  
	constraint pk_productos primary key (identificador),
	constraint fk_productos_empleados foreign key (revisor) references empleados(identificador),
	constraint fk_productos_duenios foreign key (duenio) references duenios(identificador)
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
	constraint fk_catalogos_subastas foreign key (subasta) references subastas(identificador),
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
	subasta int not null
	constraint pk_asistentes primary key (identificador),
	constraint fk_asistentes_clientes foreign key (cliente) references clientes,
	constraint fk_asistentes_subasta foreign key (subasta) references subastas
)
go

create table pujos(
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

create table registroDeSubasta(
	identificador int not null identity,
	subasta int not null,
	duenio int not null,
	producto int not null,
	cliente int not null,
	-- importe representa el precio final de adjudicación/compra (monto de la puja ganadora) que el cliente debe pagar por el producto
	importe decimal(18,2) not null constraint chkImportePagado check (importe > 0.01),
	-- comision representa el monto de la comision calculada para la plataforma de subasta basada en el porcentaje de comision del item catalogo
	comision decimal(18,2) not null constraint chkComisionPagada check (comision > 0.01),
	constraint pk_registroDeSubasta primary key (identificador),
	constraint fk_registroDeSubasta_subastas foreign key (subasta) references subastas,
	constraint fk_registroDeSubasta_duenios foreign key (duenio) references duenios,
	constraint fk_registroDeSubasta_producto foreign key (producto) references productos,
	constraint fk_registroDeSubasta_cliente foreign key (cliente) references clientes
)
go


-- =========================================================================
-- TABLAS NUEVAS AGREGADAS (NO MODIFICAN LAS ORIGINALES)
-- =========================================================================

-- Tabla secundaria para fotos de catalogos
create table catalogos_fotos(
	identificador int not null identity,
	catalogo int not null,
	foto varbinary(max) not null,
	constraint pk_catalogos_fotos primary key (identificador),
	constraint fk_catalogos_fotos_catalogos foreign key (catalogo) references catalogos(identificador)
)
go

-- Tabla secundaria para datos adicionales de pujos
create table pujos_datos_adicionales(
	identificador int not null,
	fecha_hora datetime null,
	metodo_pago int null,
	constraint pk_pujos_datos_adicionales primary key (identificador),
	constraint fk_pujos_datos_adicionales_pujos foreign key (identificador) references pujos(identificador)
)
go

-- Tabla auxiliar para sesiones reales por dispositivo/ventana
create table sesiones_personas(
	identificador int not null identity,
	persona int not null,
	token varchar(100) not null,
	fecha_creacion datetime not null,
	fecha_expiracion datetime not null,
	activa bit not null default 1,
	constraint pk_sesiones_personas primary key (identificador),
	constraint uq_sesiones_personas_token unique (token),
	constraint fk_sesiones_personas_personas foreign key (persona) references personas(identificador)
)
go

-- Tabla auxiliar para impedir que una persona este conectada a mas de una subasta a la vez
create table subastas_conexiones_activas(
	identificador int not null identity,
	persona int not null,
	sesion int null,
	subasta int not null,
	fecha_conexion datetime not null,
	fecha_actualizacion datetime not null,
	activa bit not null default 1,
	constraint pk_subastas_conexiones_activas primary key (identificador),
	constraint fk_subastas_conexiones_personas foreign key (persona) references personas(identificador),
	constraint fk_subastas_conexiones_sesiones foreign key (sesion) references sesiones_personas(identificador),
	constraint fk_subastas_conexiones_subastas foreign key (subasta) references subastas(identificador)
)
go

-- Tabla para almacenar registros en estado pendiente de aprobación administrativa
create table registros_pendientes(
	id int not null identity,
	documento varchar(20) null,
	nombre varchar(150) null,
	apellido varchar(150) null,
	email varchar(250) null,
		direccion varchar(250) null,
	pais varchar(150) null,
	foto_frente varbinary(max) null,
	foto_dorso varbinary(max) null,
	estado varchar(50) null,
	constraint pk_registros_pendientes primary key (id)
)
go

-- Tabla secundaria para datos de perfil adicionales de personas
create table personas_datos_adicionales(
	identificador int not null,
	apellido varchar(150) null,
	numeroPais int null,
	email varchar(250) not null,
	contrasena varchar(255) not null,
	contrasena_cambiada bit not null default 0,
	categoria varchar(10) null,
	constraint pk_personas_datos_adicionales primary key (identificador),
	constraint fk_personas_datos_adicionales_personas foreign key (identificador) references personas(identificador),
	constraint fk_personas_datos_adicionales_paises foreign key (numeroPais) references paises(numero)
)
go

-- Tabla secundaria para fotos del documento (DNI frente y dorso) de personas
create table personas_documentos_fotos(
	identificador int not null,
	foto_frente varbinary(max) not null,
	foto_dorso varbinary(max) not null,
	constraint pk_personas_documentos_fotos primary key (identificador),
	constraint fk_personas_documentos_fotos_personas foreign key (identificador) references personas(identificador)
)
go

-- Tabla secundaria para estadísticas de actividad de personas
create table personas_estadisticas(
	identificador int not null,
	rematesAsistidos int not null default 0,
	rematesGanados int not null default 0,
	articulosPublicados int not null default 0,
	pujasRealizadas int not null default 0,
	constraint pk_personas_estadisticas primary key (identificador),
	constraint fk_personas_estadisticas_personas foreign key (identificador) references personas(identificador)
)
go

-- Tabla para tarjetas de crédito
create table tarjetaCredito(
	identificador int not null identity,
	numeroTarjeta varchar(20) not null,
	titularTarjeta varchar(250) not null,
	fechaVencimiento varchar(5) not null,
	cvv int not null,
	constraint pk_tarjetaCredito primary key (identificador)
)
go

-- Tabla para cuentas bancarias
create table cuentaBancaria(
	identificador int not null identity,
	titularCuenta varchar(250) not null,
	nombreBanco varchar(250) not null,
	pais int not null,
	moneda varchar(10) not null,
	cbuIban varchar(50) not null,
	constraint pk_cuentaBancaria primary key (identificador),
	constraint fk_cuentaBancaria_paises foreign key (pais) references paises(numero)
)
go

-- Tabla para cheques certificados
create table chequeCertificado(
	identificador int not null identity,
	titular varchar(250) not null,
	bancoEmisor varchar(250) not null,
	numeroCheque varchar(50) not null,
	monto decimal(18,2) not null,
	pais int null,
	moneda varchar(10) null,
	comprobante varbinary(max) null,
	constraint pk_chequeCertificado primary key (identificador),
	constraint fk_chequeCertificado_paises foreign key (pais) references paises(numero)
)
go

-- Tabla para métodos de pago
create table metodoPago(
	identificador int not null identity,
	persona int not null,
	chequeCertificado int null,
	cuentaBancaria int null,
	tarjetaCredito int null,
	constraint pk_metodoPago primary key (identificador),
	constraint fk_metodoPago_personas foreign key (persona) references personas(identificador),
	constraint fk_metodoPago_cheques foreign key (chequeCertificado) references chequeCertificado(identificador),
	constraint fk_metodoPago_cuentas foreign key (cuentaBancaria) references cuentaBancaria(identificador),
	constraint fk_metodoPago_tarjetas foreign key (tarjetaCredito) references tarjetaCredito(identificador)
)
go

alter table pujos_datos_adicionales
	add constraint fk_pujos_datos_adicionales_metodo_pago foreign key (metodo_pago) references metodoPago(identificador)
go

-- Tabla auxiliar para compromisos acumulados de cheques certificados
create table cheques_certificados_compromisos(
	identificador int not null identity,
	cheque_certificado int not null,
	pujo int not null,
	item int not null,
	monto decimal(18,2) not null,
	estado varchar(20) not null default 'ACTIVO',
	fecha_hora datetime not null,
	constraint pk_cheques_certificados_compromisos primary key (identificador),
	constraint fk_cheques_compromisos_cheques foreign key (cheque_certificado) references chequeCertificado(identificador),
	constraint fk_cheques_compromisos_pujos foreign key (pujo) references pujos(identificador),
	constraint fk_cheques_compromisos_items foreign key (item) references itemsCatalogo(identificador)
)
go

-- Tabla secundaria para método de pago del registro de subastas
create table registro_de_subasta_datos_adicionales(
	identificador int not null,
	metodoPago int not null,
	tipoEntrega varchar(20) null,
	costoEnvio decimal(18,2) null,
	constraint pk_rds_datos_adicionales primary key (identificador),
	constraint fk_rds_datos_adicionales_rds foreign key (identificador) references registroDeSubasta(identificador),
	constraint fk_rds_datos_adicionales_metodoPago foreign key (metodoPago) references metodoPago(identificador)
)
go

-- Tabla auxiliar para multas, plazos y bloqueos por falta de pago
create table clientes_deudas_subasta(
	identificador int not null identity,
	cliente int not null,
	registro_subasta int not null,
	monto_original decimal(18,2) not null,
	monto_multa decimal(18,2) not null,
	monto_total decimal(18,2) not null,
	estado varchar(20) not null default 'PENDIENTE',
	fecha_generacion datetime not null,
	fecha_vencimiento datetime not null,
	fecha_regularizacion datetime null,
	constraint pk_clientes_deudas_subasta primary key (identificador),
	constraint fk_clientes_deudas_subasta_cliente foreign key (cliente) references clientes(identificador),
	constraint fk_clientes_deudas_subasta_registro foreign key (registro_subasta) references registroDeSubasta(identificador)
)
go

-- Tabla secundaria para datos adicionales de subastas (titulo, descripcion, foto, direccion detallada)
create table subastas_datos_adicionales(
	identificador int not null,
	titulo varchar(250) not null,
	descripcion varchar(max) null,
	direccion_detallada varchar(350) null,
	moneda varchar(10) not null default 'pesos',
	constraint pk_subastas_datos_adicionales primary key (identificador),
	constraint fk_subastas_datos_adicionales_subastas foreign key (identificador) references subastas(identificador)
)
go

-- Tabla secundaria para datos adicionales de productos (nombre, descripcion, creador, historia)
create table productos_datos_adicionales(
	identificador int not null,
	nombre varchar(250) not null,
	descripcion varchar(max) null,
	esArteODisenador bit null,
	nombreCreador varchar(250) null,
	historia varchar(max) null,
	constraint pk_productos_datos_adicionales primary key (identificador),
	constraint fk_productos_datos_adicionales_productos foreign key (identificador) references productos(identificador)
)
go

-- Tabla para propuestas comerciales
create table propuestas_comerciales(
	id int not null identity,
	producto_id int not null unique,
	valor_base decimal(18,2) not null,
	comision decimal(18,2) not null,
	ubicacion_subasta varchar(350) null,
	fecha_estimada date null,
	estado varchar(50) null default 'PENDIENTE',
	constraint pk_propuestas_comerciales primary key (id),
	constraint fk_propuestas_comerciales_productos foreign key (producto_id) references productos(identificador)
)
go

-- Tabla auxiliar para moneda de propuestas comerciales
create table propuestas_comerciales_datos_adicionales(
	id int not null,
	moneda varchar(10) not null default 'pesos',
	constraint pk_propuestas_comerciales_datos_adicionales primary key (id),
	constraint fk_propuestas_comerciales_datos_adicionales_propuestas foreign key (id) references propuestas_comerciales(id)
)
go

-- Tabla para notificaciones de sistema
create table notificaciones(
	identificador int not null identity,
	persona_id int not null,
	titulo varchar(250) not null,
	cuerpo varchar(max) not null,
	accion varchar(50) null,
	leida bit not null default 0,
	fecha datetime not null default getdate(),
	constraint pk_notificaciones primary key (identificador),
	constraint fk_notificaciones_personas foreign key (persona_id) references personas(identificador)
)
go

-- Tabla secundaria para fecha de fin de puja de items
create table items_catalogo_datos_adicionales(
	identificador int not null,
	fecha_fin_puja datetime null,
	constraint pk_ic_datos_adicionales primary key (identificador),
	constraint fk_ic_datos_adicionales_ic foreign key (identificador) references itemsCatalogo(identificador)
)
go

