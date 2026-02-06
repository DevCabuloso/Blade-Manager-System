import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '..', '.env') })


const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_KEY || ''

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ ERRO CRÍTICO: SUPABASE_URL ou SUPABASE_KEY não configurados!');
  console.error('Verifique o arquivo backend/.env');
  console.error('SUPABASE_URL:', SUPABASE_URL ? 'Configurado' : '❌ NÃO CONFIGURADO');
  console.error('SUPABASE_KEY:', SUPABASE_KEY ? 'Configurado' : '❌ NÃO CONFIGURADO');
} else {
  console.log('✅ Variáveis de Supabase carregadas do .env');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function testarConexao() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Teste de conexão pulado: Variáveis não configuradas');
    return;
  }
  try {
    console.log('🔄 Testando conexão com Supabase...');
    const { data, error } = await supabase.from('usuarios').select('*').limit(1)
    if (error) {
      console.error('❌ Erro na query Supabase:', error.message);
      throw error;
    }
    console.log('✅ Conexão com o Supabase estabelecida!');
  } catch (err) {
    console.error('❌ Falha na conexão com o Supabase:', err.message);
    if (err.toString().includes('fetch')) {
      console.error('💡 Dica: Verifique sua conexão de internet e firewall');
    }
    if (err.toString().includes('401') || err.toString().includes('403')) {
      console.error('💡 Dica: Suas credenciais Supabase podem estar inválidas');
    }
  }
}

testarConexao()

export default supabase
