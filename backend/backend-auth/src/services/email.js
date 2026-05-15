import { Resend } from 'resend';

// Lazy init: dotenv aún no ha corrido cuando este módulo se importa en ESM
let _resend;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

export async function sendWelcomeEmail({ email, nombre, empleadoId, password }) {
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bienvenido a Vertiche</title>
</head>
<body style="margin:0;padding:0;background:#F8F6F3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F6F3;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;background:#FFFFFF;border-radius:20px;border:1px solid #E7E2DC;box-shadow:0 8px 40px rgba(0,0,0,0.07);overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:36px 36px 28px;border-bottom:1px solid #F0EDE8;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;padding-right:10px;">
                    <div style="width:32px;height:32px;background:#111111;border-radius:8px;display:flex;align-items:center;justify-content:center;">
                      <div style="width:10px;height:10px;background:#D8C3A5;transform:rotate(45deg);border-radius:2px;margin:11px auto;"></div>
                    </div>
                  </td>
                  <td style="vertical-align:middle;">
                    <span style="font-weight:700;font-size:18px;color:#111111;letter-spacing:-0.03em;">Vertiche</span>
                  </td>
                </tr>
              </table>
              <h1 style="margin:20px 0 4px;font-size:20px;font-weight:600;color:#111111;letter-spacing:-0.02em;">
                Bienvenido al sistema
              </h1>
              <p style="margin:0;font-size:13px;color:#6B6B6B;">
                Tu cuenta ha sido creada. Aquí están tus credenciales de acceso.
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:28px 36px 32px;">
              <p style="margin:0 0 6px;font-size:13px;color:#6B6B6B;">Hola, <strong style="color:#111111;">${nombre}</strong></p>
              <p style="margin:0 0 24px;font-size:13px;color:#6B6B6B;line-height:1.6;">
                Tu cuenta en el Sistema de Gestión CEDIS ha sido creada correctamente.
                Al iniciar sesión por primera vez se te pedirá que establezcas una nueva contraseña.
              </p>

              <!-- Credentials box -->
              <div style="background:#F8F6F3;border:1px solid #E7E2DC;border-radius:12px;padding:20px 22px;margin-bottom:24px;">
                <p style="margin:0 0 14px;font-size:11px;font-weight:600;color:#6B6B6B;text-transform:uppercase;letter-spacing:0.06em;">
                  Tus credenciales de acceso
                </p>

                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:6px 0;border-bottom:1px solid #E7E2DC;">
                      <span style="font-size:12px;color:#6B6B6B;">ID de empleado</span>
                    </td>
                    <td style="padding:6px 0;border-bottom:1px solid #E7E2DC;text-align:right;">
                      <strong style="font-size:12px;color:#111111;font-family:monospace;">${empleadoId}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;border-bottom:1px solid #E7E2DC;">
                      <span style="font-size:12px;color:#6B6B6B;">Correo electrónico</span>
                    </td>
                    <td style="padding:6px 0;border-bottom:1px solid #E7E2DC;text-align:right;">
                      <strong style="font-size:12px;color:#111111;">${email}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;">
                      <span style="font-size:12px;color:#6B6B6B;">Contraseña temporal</span>
                    </td>
                    <td style="padding:6px 0;text-align:right;">
                      <strong style="font-size:12px;color:#111111;font-family:monospace;">${password}</strong>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Warning -->
              <div style="background:#FDF2EF;border:1px solid #F0D5CF;border-radius:10px;padding:12px 16px;margin-bottom:24px;">
                <p style="margin:0;font-size:12px;color:#B65E4A;line-height:1.5;">
                  ⚠️ Esta contraseña es temporal. Se te pedirá cambiarla en tu primer inicio de sesión.
                </p>
              </div>

              <p style="margin:0;font-size:12px;color:#AAAAAA;line-height:1.5;">
                Si no solicitaste esta cuenta o crees que recibiste este correo por error, ignóralo o contacta al administrador del sistema.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 36px;border-top:1px solid #F0EDE8;text-align:center;">
              <p style="margin:0;font-size:11px;color:#AAAAAA;letter-spacing:0.02em;">
                © 2026 Vertiche · Sistema interno · Este correo es generado automáticamente
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const { error } = await getResend().emails.send({
    from: process.env.RESEND_FROM,
    to: email,
    subject: 'Tu cuenta en Vertiche ha sido creada',
    html,
  });
  if (error) throw new Error(error.message);
}
