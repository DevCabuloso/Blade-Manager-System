#!/usr/bin/env node

/**
 * Script de Diagnóstico - Blade Manager System
 * Verifica conexão com Supabase e variáveis de ambiente
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🔍 DIAGNÓSTICO - Blade Manager System\n');
console.log('='.repeat(50));

// 1. Verificar .env
console.log('\n1️⃣  VERIFICANDO ARQUIVO .env...');
const envPath = path.join(__dirname, 'backend', '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ Arquivo .env encontrado');
  dotenv.config({ path: envPath });
} else {
  console.log('❌ Arquivo .env NÃO encontrado em:', envPath);
  console.log('   → Crie uma cópia de backend/.env.example');
  process.exit(1);
}

// 2. Verificar variáveis de ambiente
console.log('\n2️⃣  VERIFICANDO VARIÁVEIS DE AMBIENTE...');
const requiredVars = [
  'SUPABASE_URL',
  'SUPABASE_KEY',
  'PORT',
  'JWT_SECRET',
  'EMAIL_HOST',
  'EMAIL_USER',
  'EMAIL_PASS',
  'APP_BASE_URL'
];

let missingVars = [];
requiredVars.forEach(varName => {
  if (process.env[varName]) {
    const value = varName.includes('KEY') || varName.includes('PASS') 
      ? '***' 
      : process.env[varName];
    console.log(`✅ ${varName}: ${value}`);
  } else {
    console.log(`❌ ${varName}: NÃO CONFIGURADO`);
    missingVars.push(varName);
  }
});

if (missingVars.length > 0) {
  console.log(`\n⚠️  ${missingVars.length} variável(is) faltando!`);
  process.exit(1);
}

// 3. Testar conexão Supabase
console.log('\n3️⃣  TESTANDO CONEXÃO SUPABASE...');
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

try {
  console.log('🔄 Conectando a:', process.env.SUPABASE_URL);
  const { data, error } = await supabase
    .from('usuarios')
    .select('count')
    .limit(1);

  if (error) {
    console.log('❌ Erro na query:', error.message);
    console.log('   Detalhes:', error);
    
    if (error.message.includes('fetch')) {
      console.log('\n💡 SOLUÇÃO: Verifique sua conexão de internet e firewall');
    }
    if (error.message.includes('401') || error.message.includes('403')) {
      console.log('\n💡 SOLUÇÃO: Suas credenciais Supabase podem estar inválidas');
      console.log('   Vá em https://supabase.com e verifique:');
      console.log('   - Project ID');
      console.log('   - Anon/Public Key');
    }
  } else {
    console.log('✅ Conexão com Supabase estabelecida com sucesso!');
  }
} catch (err) {
  console.log('❌ Erro ao conectar:', err.message);
  console.log('\n💡 POSSÍVEIS CAUSAS:');
  console.log('   - Firewall bloqueando supabase.co');
  console.log('   - VPN interferindo na conexão');
  console.log('   - Credenciais Supabase inválidas');
  console.log('   - Problema de rede');
}

// 4. Verificar estrutura de pastas
console.log('\n4️⃣  VERIFICANDO ESTRUTURA DE PASTAS...');
const requiredFolders = [
  'backend',
  'backend/config',
  'backend/controllers',
  'backend/routes',
  'backend/middlewares',
  'frontend',
  'frontend/pages',
  'frontend/components'
];

requiredFolders.forEach(folder => {
  const folderPath = path.join(__dirname, folder);
  if (fs.existsSync(folderPath)) {
    console.log(`✅ ${folder}`);
  } else {
    console.log(`❌ ${folder} - NÃO ENCONTRADO`);
  }
});

// 5. Verificar Node.js e npm
console.log('\n5️⃣  VERIFICANDO DEPENDÊNCIAS...');
console.log('✅ Node.js:', process.version);

// 6. Resumo
console.log('\n' + '='.repeat(50));
console.log('\n📋 RESUMO:');
if (missingVars.length === 0) {
  console.log('✅ Todas as verificações básicas passaram!');
  console.log('\n🚀 Próximos passos:');
  console.log('   1. npm run dev');
  console.log('   2. Acesse http://localhost:5173');
  console.log('   3. Teste o registro/login');
} else {
  console.log('❌ Verifique os problemas acima');
}

console.log('\n' + '='.repeat(50) + '\n');
