import transporter from './config/mailer.js';
import dotenv from 'dotenv';
dotenv.config();

console.log('🧪 Testando configuração de email...\n');

// Verificar variáveis de ambiente
console.log('📋 Variáveis de Ambiente:');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST || 'smtp.gmail.com');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Configurado' : '❌ NÃO CONFIGURADO');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Configurado' : '❌ NÃO CONFIGURADO');
console.log('APP_BASE_URL:', process.env.APP_BASE_URL || '❌ NÃO CONFIGURADO');
console.log('\n');

// Testar conexão SMTP
console.log('🔌 Testando conexão SMTP...');
transporter.verify(async (error, success) => {
  if (error) {
    console.error('❌ Erro na conexão SMTP:', error);
    process.exit(1);
  }

  console.log('✅ Servidor SMTP conectado com sucesso!\n');

  // Enviar email de teste
  console.log('📧 Enviando email de teste...');
  try {
    const info = await transporter.sendMail({
      from: `"Blade Manager" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Enviar para o próprio email de teste
      subject: 'Teste de Conexão - Blade Manager',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="background: #fff; padding: 20px; border-radius: 10px;">
            <h2>Teste de Conexão SMTP</h2>
            <p>Este é um email de teste para verificar se o Nodemailer está funcionando corretamente.</p>
            <p>Se você recebeu este email, a configuração está correta! ✅</p>
            <hr>
            <p><small>Enviado em: ${new Date().toLocaleString('pt-BR')}</small></p>
          </div>
        </div>
      `,
    });

    console.log('✅ Email enviado com sucesso!');
    console.log('📊 Detalhes da resposta:');
    console.log('   - Message ID:', info.messageId);
    console.log('   - Response:', info.response);
    console.log('\n✨ Tudo funcionando corretamente!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro ao enviar email:', err.message);
    console.error('Detalhes:', err);
    process.exit(1);
  }
});
