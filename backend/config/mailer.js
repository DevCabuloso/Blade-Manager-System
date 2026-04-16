import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import dns from 'dns';
dotenv.config();

// Railway/containers may have partial IPv6 egress; prefer IPv4 for SMTP lookups.
dns.setDefaultResultOrder('ipv4first');

const EMAIL_PORT = Number(process.env.EMAIL_PORT || 587);
const EMAIL_SECURE = process.env.EMAIL_SECURE
  ? String(process.env.EMAIL_SECURE).toLowerCase() === 'true'
  : EMAIL_PORT === 465;
const VERIFY_SMTP_ON_STARTUP = String(process.env.VERIFY_SMTP_ON_STARTUP || 'false').toLowerCase() === 'true';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: EMAIL_PORT,
  secure: EMAIL_SECURE,
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 20000,
  dnsTimeout: 10000,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Testar conexão com o servidor SMTP na inicialização
if (VERIFY_SMTP_ON_STARTUP) {
  transporter.verify((error) => {
    if (error) {
      console.error('⚠️ Falha ao verificar SMTP na inicialização:', error.message);
      return;
    }
    console.log('✅ Servidor SMTP conectado e pronto para enviar emails!');
  });
} else {
  console.log('ℹ️ Verificação SMTP na inicialização desativada (VERIFY_SMTP_ON_STARTUP=false).');
}

export default transporter;
