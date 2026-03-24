import nodemailer from 'nodemailer';
import { env } from '../config/env';


const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

// Verify connection on startup (non-blocking)
transporter.verify((error) => {
  if (error) {
    console.warn('⚠️  Mail server connection failed:', error.message);
  } else {
    console.log('✅ Mail server connected successfully');
  }
});

export interface MailOptions {
  to: string;
  subject: string;
  html: string;
}


export const sendMail = async (options: MailOptions): Promise<void> => {
  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
};

/**
 * Envía un correo de verificación OTP con estilo.
 * @param to - dirección de correo electrónico del destinatario
 * @param code - código OTP de 6 dígitos
 * @param resourceName - nombre del destino o publicación del blog
 */
export const sendVerificationEmail = async (
  to: string,
  code: string,
  resourceName: string
): Promise<void> => {
  await sendMail({
    to,
    subject: ` Tu código de verificación DominicanGo: ${code}`,
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verificación DominicanGo</title>
      </head>
      <body style="margin:0; padding:0; background-color:#f4f7f9; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                <!-- Header -->
                <tr>
                  <td style="background: #0ea5e9; padding: 32px; text-align:center;">
                    <h1 style="margin:0; color:#ffffff; font-size:28px; font-weight:800; letter-spacing:-0.5px;">
                       DominicanGo
                    </h1>
                   
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding: 40px 48px;">
                    <h2 style="margin:0 0 12px; color:#1e293b; font-size:22px; font-weight:700;">
                      Confirma tu publicación
                    </h2>
                    <p style="margin:0 0 24px; color:#64748b; font-size:15px; line-height:1.6;">
                      Recibimos tu envío de <strong>"${resourceName}"</strong>.
                      Usa el código de abajo para verificar y publicar tu contenido.
                    </p>
                    <!-- OTP Code -->
                    <div style="background:#f8fafc; border: 2px dashed #0ea5e9; border-radius:10px; padding: 24px; text-align:center; margin-bottom:24px;">
                      <p style="margin:0 0 8px; font-size:12px; color:#64748b; text-transform:uppercase; letter-spacing:1px; font-weight:600;">
                        Tu código OTP
                      </p>
                      <p style="margin:0; font-size:42px; font-weight:900; letter-spacing:8px; color:#0ea5e9; font-family: monospace;">
                        ${code}
                      </p>
                    </div>
                    <p style="margin:0; color:#94a3b8; font-size:13px; text-align:center;">
                      Este código expira en <strong>15 minutos</strong>. No lo compartas con nadie.
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background:#f8fafc; padding: 24px 48px; border-top: 1px solid #e2e8f0; text-align:center;">
                    <p style="margin:0; color:#94a3b8; font-size:12px;">
                      Si no realizaste esta acción, puedes ignorar este correo con seguridad.
                    </p>
                    <p style="margin:8px 0 0; color:#94a3b8; font-size:12px;">
                      © 2026 DominicanGo · Dominican Republic
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  });
};
