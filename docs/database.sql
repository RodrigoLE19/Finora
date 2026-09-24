CREATE TABLE usuarios (
    id_usuario INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categorias (
    id_categoria INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(10) NOT NULL,
    CONSTRAINT chk_categoria_tipo
        CHECK (tipo IN ('INGRESO', 'GASTO'))
);

INSERT INTO categorias (nombre, tipo) VALUES
('Alimentación', 'GASTO'),
('Transporte', 'GASTO'),
('Hogar', 'GASTO'),
('Entretenimiento', 'GASTO'),
('Servicios', 'GASTO'),
('Salud', 'GASTO'),
('Educación', 'GASTO'),
('Otros', 'GASTO'),
('Sueldo', 'INGRESO'),
('Ingreso adicional', 'INGRESO'),
('Otros', 'INGRESO');

CREATE TABLE movimientos (
    id_movimiento INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    id_categoria INTEGER NOT NULL,
    id_gasto_recurrente INTEGER,
    tipo VARCHAR(10) NOT NULL,
    monto NUMERIC(12,2) NOT NULL,
    descripcion VARCHAR(255),
    fecha DATE NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_movimiento_tipo
        CHECK (tipo IN ('INGRESO', 'GASTO')),

    CONSTRAINT chk_movimiento_monto
        CHECK (monto > 0),

    CONSTRAINT fk_movimiento_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE,

    CONSTRAINT fk_movimiento_categoria
        FOREIGN KEY (id_categoria)
        REFERENCES categorias(id_categoria)
);

CREATE TABLE presupuestos (
    id_presupuesto INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    id_categoria INTEGER NOT NULL,
    monto_limite NUMERIC(12,2) NOT NULL,
    mes INTEGER NOT NULL,
    anio INTEGER NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_presupuesto_monto
        CHECK (monto_limite > 0),

    CONSTRAINT chk_presupuesto_mes
        CHECK (mes BETWEEN 1 AND 12),

    CONSTRAINT fk_presupuesto_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE,

    CONSTRAINT fk_presupuesto_categoria
        FOREIGN KEY (id_categoria)
        REFERENCES categorias(id_categoria),

    CONSTRAINT uq_presupuesto_usuario_categoria_periodo
        UNIQUE (id_usuario, id_categoria, mes, anio)
);

CREATE TABLE gastos_recurrentes (
    id_gasto_recurrente INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    id_categoria INTEGER NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    monto NUMERIC(12,2) NOT NULL,
    frecuencia VARCHAR(20) NOT NULL,
    dia_pago INTEGER,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_gasto_recurrente_monto
        CHECK (monto > 0),

    CONSTRAINT chk_gasto_recurrente_frecuencia
        CHECK (frecuencia IN ('MENSUAL')),

    CONSTRAINT chk_gasto_recurrente_dia_pago
        CHECK (dia_pago IS NULL OR dia_pago BETWEEN 1 AND 31),

    CONSTRAINT fk_gasto_recurrente_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE,

    CONSTRAINT fk_gasto_recurrente_categoria
        FOREIGN KEY (id_categoria)
        REFERENCES categorias(id_categoria)
);

ALTER TABLE movimientos
ADD CONSTRAINT fk_movimiento_gasto_recurrente
FOREIGN KEY (id_gasto_recurrente)
REFERENCES gastos_recurrentes(id_gasto_recurrente)
ON DELETE SET NULL;