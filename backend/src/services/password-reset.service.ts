import { randomBytes, createHash } from 'node:crypto';
import { pool } from '../config/database';
import { enviarCorreoRecuperacion } from './email.service';
import bcrypt from 'bcryptjs';

export const solicitarRecuperacion = async (
  email: string
): Promise<void> => {
  const emailNormalizado = email.trim().toLowerCase();
  const cliente = await pool.connect();

  let token = '';
  let tokenHash = '';
  let destinatario = '';

  try {
    await cliente.query('BEGIN');

    const resultado = await cliente.query(
      `SELECT id_usuario, email
       FROM usuarios
       WHERE email = $1
       FOR UPDATE`,
      [emailNormalizado]
    );

    if (resultado.rows.length === 0) {
      await cliente.query('COMMIT');
      return;
    }

    const usuario = resultado.rows[0];

    const solicitudReciente = await cliente.query(
      `SELECT id_token
       FROM password_reset_tokens
       WHERE id_usuario = $1
         AND fecha_creacion > NOW() - INTERVAL '1 minute'
       LIMIT 1`,
      [usuario.id_usuario]
    );

    if (solicitudReciente.rows.length > 0) {
      await cliente.query('COMMIT');
      return;
    }

    token = randomBytes(32).toString('hex');

    tokenHash = createHash('sha256')
      .update(token)
      .digest('hex');

    destinatario = usuario.email;

    await cliente.query(
      `INSERT INTO password_reset_tokens (
         id_usuario,
         token_hash,
         fecha_expiracion
       )
       VALUES ($1, $2, NOW() + INTERVAL '15 minutes')`,
      [usuario.id_usuario, tokenHash]
    );

    await cliente.query('COMMIT');
  } catch (error) {
    await cliente.query('ROLLBACK');
    throw error;
  } finally {
    cliente.release();
  }

  try {
    await enviarCorreoRecuperacion(destinatario, token);
  } catch (error) {
    
    await pool.query(
      'DELETE FROM password_reset_tokens WHERE token_hash = $1',
      [tokenHash]
    );

    throw error;
  }
};

export const restablecerPassword = async (
  token: string,
  nuevaPassword: string
): Promise<void> => {
  if (!/^[a-f0-9]{64}$/.test(token)) {
    throw new Error('INVALID_RESET_TOKEN');
  }

  if (
    nuevaPassword.length < 6 ||
    Buffer.byteLength(nuevaPassword, 'utf8') > 72
  ) {
    throw new Error('INVALID_PASSWORD');
  }

  const tokenHash = createHash('sha256')
    .update(token)
    .digest('hex');

  const passwordHash = await bcrypt.hash(nuevaPassword, 10);
  const cliente = await pool.connect();

  try {
    await cliente.query('BEGIN');

    const resultado = await cliente.query(
      `SELECT id_usuario
       FROM password_reset_tokens
       WHERE token_hash = $1`,
      [tokenHash]
    );

    if (resultado.rows.length === 0) {
      throw new Error('INVALID_RESET_TOKEN');
    }

    const idUsuario = resultado.rows[0].id_usuario;

    await cliente.query(
      `SELECT id_usuario
       FROM usuarios
       WHERE id_usuario = $1
       FOR UPDATE`,
      [idUsuario]
    );

    const tokenValido = await cliente.query(
      `SELECT id_token
       FROM password_reset_tokens
       WHERE token_hash = $1
         AND fecha_uso IS NULL
         AND fecha_expiracion > clock_timestamp()
       FOR UPDATE`,
      [tokenHash]
    );

    if (tokenValido.rows.length === 0) {
      throw new Error('INVALID_RESET_TOKEN');
    }

    await cliente.query(
      `UPDATE usuarios
       SET password_hash = $1
       WHERE id_usuario = $2`,
      [passwordHash, idUsuario]
    );

    await cliente.query(
      `UPDATE password_reset_tokens
       SET fecha_uso = clock_timestamp()
       WHERE id_usuario = $1
         AND fecha_uso IS NULL`,
      [idUsuario]
    );

    await cliente.query('COMMIT');
  } catch (error) {
    await cliente.query('ROLLBACK');
    throw error;
  } finally {
    cliente.release();
  }
};