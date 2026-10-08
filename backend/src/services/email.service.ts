import { google } from "googleapis";

export const enviarCorreoRecuperacion = async (
    destinatario: string,
    token: string
): Promise<void> => {
    const {
        GMAIL_CLIENT_ID,
        GMAIL_CLIENT_SECRET,
        GMAIL_REFRESH_TOKEN,
        GMAIL_USER,
        FRONTEND_URL
    } = process.env;

    if (
        !GMAIL_CLIENT_ID ||
        !GMAIL_CLIENT_SECRET ||
        !GMAIL_REFRESH_TOKEN ||
        !GMAIL_USER ||
        !FRONTEND_URL
    ) {
       throw new Error('Configuración de correo incompleta'); 
    }

    const oauthClient = new google.auth.OAuth2(GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET);

    oauthClient.setCredentials({refresh_token: GMAIL_REFRESH_TOKEN});

    const gmail = google.gmail({
        version: 'v1',
        auth: oauthClient
    });

    const enlace = new URL('/reset-password', FRONTEND_URL);
    enlace.searchParams.set('token', token);

    const contenido = [
        'Hola,',
        'Recibimos una solicitud para cambiar tu contraseña de Finora.',
        '',
        'Abre el enlace para crear una nueva contraseña:',
        enlace.toString(),
        '',
        'EL enlace vence en 15 minutos y solo puedes utilizarse una vez.',
        '',
        'Si no solicitaste este cambio, ignora este correo.',
        '',
        'Finora'
    ].join('\r\n');

    if (/[\r\n]/.test(destinatario + GMAIL_USER)) {
        throw new Error('Dirección de correo inválido');
    }

    const asunto = Buffer.from(
        'Finora: recupera tu contraseña',
        'utf8'
    ).toString('base64');

    const mensaje = [
        `From: Finora <${GMAIL_USER}>`,
        `To: ${destinatario}`,
        `Subject:  =?UTF-8?B?${asunto}?=`,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: base64',
        '',
        Buffer.from(contenido, 'utf8').toString('base64')
    ].join('\r\n');

    await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
            raw: Buffer.from(mensaje, 'utf8').toString('base64url')
        }
    });
}