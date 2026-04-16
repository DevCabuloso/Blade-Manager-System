import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Testar conexão com o servidor SMTP na inicialização
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Erro de conexão SMTP:', error.message);
  } else {
    console.log('✅ Servidor SMTP conectado e pronto para enviar emails!');
  }
});

export default transporter;
