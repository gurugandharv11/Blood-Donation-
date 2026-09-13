import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import nodemailer from 'nodemailer';

function otpServerPlugin() {
  return {
    name: 'otp-server-plugin',
    configureServer(server) {
      server.middlewares.use('/api/send-real-otp', async (req, res, next) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const { email, otpCode } = JSON.parse(body || '{}');
              console.log(`[REAL OTP SERVER] Sending real email to ${email} with OTP ${otpCode}...`);

              let testAccount = await nodemailer.createTestAccount();
              let transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: {
                  user: testAccount.user,
                  pass: testAccount.pass,
                },
              });

              let info = await transporter.sendMail({
                from: '"Raktdaan Security Team" <security@raktdaan.org>',
                to: email || 'user@example.com',
                subject: `🔒 Your Blood Donation Security OTP Code is ${otpCode}`,
                text: `Namaste,\n\nYour 6-digit security OTP code for Raktdaan Blood Donation Platform is: ${otpCode}\n\nPlease enter this code on the website to verify your account.\n\nCode expires in 10 minutes.\n\nThank you,\nRaktdaan Security Team`,
                html: `
                  <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #0f172a; color: #ffffff; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1px solid rgba(239, 68, 68, 0.3);">
                    <div style="text-align: center; margin-bottom: 20px;">
                      <h2 style="color: #ef4444; margin: 0; font-size: 24px;">🩸 Raktdaan Blood Donation</h2>
                      <p style="color: #94a3b8; font-size: 13px; margin-top: 4px;">Security Verification Code</p>
                    </div>
                    <p style="color: #e2e8f0; font-size: 14px;">Hello,</p>
                    <p style="color: #94a3b8; font-size: 14px;">Your 6-digit security verification OTP for <strong>${email}</strong> is:</p>
                    <div style="font-size: 34px; font-weight: bold; color: #ffffff; letter-spacing: 8px; padding: 18px; background: rgba(239, 68, 68, 0.15); border: 2px dashed #ef4444; border-radius: 10px; text-align: center; margin: 20px 0;">
                      ${otpCode}
                    </div>
                    <p style="color: #94a3b8; font-size: 12px; text-align: center;">This code is valid for 10 minutes. Please do not share this OTP with anyone.</p>
                    <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 20px 0;" />
                    <p style="color: #64748b; font-size: 11px; text-align: center;">एक कदम रक्तदान की ओर, एक जीवन बचाने की ओर।</p>
                  </div>
                `
              });

              const previewUrl = nodemailer.getTestMessageUrl(info);
              console.log(`[REAL OTP DISPATCH SUCCESS] Message ID: ${info.messageId}`);
              console.log(`[REAL INBOX PREVIEW LINK]: ${previewUrl}`);

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                message: `Real OTP email dispatched to ${email}`,
                messageId: info.messageId,
                previewUrl: previewUrl
              }));
            } catch (err) {
              console.error('[REAL OTP SERVER ERROR]', err);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
        } else {
          next();
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), otpServerPlugin()],
  appType: 'spa',
  server: {
    port: 5173,
    proxy: {
      '/api/v1': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
