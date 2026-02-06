# 🆘 ERRO 500 - GUIA PASSO A PASSO

**Seu projeto retorna erro 500 ao tentar acessar `/api/usuarios`**

---

## 📋 PASSO 1: DIAGNOSTICAR (2 minutos)

### A. Abra um novo terminal
```bash
# Navegue até a pasta do projeto
cd c:\Users\Usuario\Downloads\Blade-Manager-System-main
```

### B. Execute o diagnóstico
```bash
npm run diagnose
```

### C. Veja a saída
A saída vai mostrar algo assim:

```
✅ Arquivo .env encontrado
✅ SUPABASE_URL: https://qoihvoikodeyhuqvjogt.supabase.co
✅ SUPABASE_KEY: ***
✅ Conexão com Supabase estabelecida com sucesso!
✅ Todas as verificações básicas passaram!
```

**Ou pode mostrar erros como:**
```
❌ Arquivo .env NÃO encontrado
❌ SUPABASE_KEY: NÃO CONFIGURADO
❌ Erro ao conectar: TypeError: fetch failed
```

---

## 🔧 PASSO 2: RESOLVER (5-15 minutos)

### Cenário A: ".env não encontrado"

```bash
# 1. Verifique se arquivo existe
ls backend/.env

# 2. Se não existir, crie a partir do exemplo
cp backend/.env.example backend/.env

# 3. Abra o arquivo e confira os valores
cat backend/.env

# Deve conter:
# PORT=8000
# SUPABASE_URL=https://qoihvoikodeyhuqvjogt.supabase.co
# SUPABASE_KEY=eyJ...
# (mais variáveis abaixo)
```

---

### Cenário B: "Variáveis faltando"

```bash
# 1. Abra o arquivo .env em um editor de texto
# Windows: notepad backend\.env
# VS Code: code backend\.env

# 2. Verifique e preencha:
PORT=8000
JWT_SECRET=seu_segredo
SUPABASE_URL=https://qoihvoikodeyhuqvjogt.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvaWh2b2lrb2RleWh1cXZqb2d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NDE4NzYsImV4cCI6MjA3NzAxNzg3Nn0.J71wfq4oCwpdw7oxcpl8fr_uhge8hSU0QaVP6ZvZYog
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=blademanagersystem@gmail.com
EMAIL_PASS=pmzheklvlevnawov
APP_BASE_URL=http://localhost:5173

# 3. Salve o arquivo (Ctrl+S)

# 4. Reinicie o servidor (próximo passo)
```

---

### Cenário C: "Erro ao conectar Supabase"

#### Opção C1: Credenciais expiradas
```bash
# 1. Vá em: https://supabase.com
# 2. Faça login na sua conta
# 3. Clique no projeto "qoihvoikodeyhuqvjogt"
# 4. Vá em "Settings" → "API"
# 5. Copie:
#    - Project URL → Coloque em SUPABASE_URL
#    - anon/public key → Coloque em SUPABASE_KEY
# 6. Salve no arquivo backend/.env
# 7. Reinicie o servidor
```

#### Opção C2: Problema de rede
```bash
# 1. Teste se consegue acessar Supabase
curl https://qoihvoikodeyhuqvjogt.supabase.co

# Se receber um erro ou timeout:
# - Firewall pode estar bloqueando
# - VPN pode estar interferindo
# - Problema de conexão de internet

# Solução:
# - Desconecte VPN se estiver usando
# - Verifique firewall (Windows Defender)
# - Reinicie o modem/roteador
```

---

## 🔄 PASSO 3: REINICIAR SERVIDOR (2 minutos)

```bash
# 1. Parar servidor atual
# No terminal, pressione: Ctrl+C

# 2. Aguarde aparecer: "^C"
# Pode demorar um pouco

# 3. Limpar dependências
rm -r backend/node_modules
npm install --prefix backend

# 4. Reiniciar
npm run dev:backend

# 5. Aguarde aparecer:
# ✅ "Servidor rodando em http://localhost:8000"
# ✅ "Conexão com o Supabase estabelecida!"
```

---

## ✅ PASSO 4: TESTAR (2 minutos)

```bash
# 1. Abra outro terminal (Ctrl+Shift+`)

# 2. Inicie o frontend
npm run dev

# Ou apenas o Vite:
npx vite

# 3. Navegador deve abrir automaticamente
# Ou acesse: http://localhost:5173

# 4. Teste:
# - Tente se registrar
# - Ou fazer login
# - Veja se aparece erro 500
```

---

## 📊 RESULTADO ESPERADO

### Se funcionou ✅
- Página carrega sem erro
- Registro/Login funciona
- Console do navegador sem erros
- Terminal mostra "✅ Conexão com o Supabase estabelecida!"

### Se ainda não funciona ❌
- Erro 500 continua
- Console mostra "TypeError: fetch failed"
- Terminal mostra "Falha na conexão com o Supabase"

---

## 🎯 SE AINDA NÃO FUNCIONAR (Opção Nuclear)

```bash
# 1. Pare todos os servidores (Ctrl+C em todos os terminais)

# 2. Limpe TUDO
rm -r node_modules
rm -r backend/node_modules
rm package-lock.json
rm backend/package-lock.json

# 3. Reinstale
npm install
cd backend
npm install
cd ..

# 4. Execute diagnóstico novamente
npm run diagnose

# 5. Se diagnóstico passou:
npm run dev:backend

# 6. Em outro terminal:
npm run dev
```

---

## 📞 INFORMAÇÕES IMPORTANTES

### Arquivo que foi atualizado
- ✅ `backend/config/db.js` - Melhor tratativa de erros
- ✅ `backend/controllers/userController.js` - Mais detalhes de erro
- ✅ `package.json` - Novo comando `npm run diagnose`
- ✅ `backend/diagnose.js` - Script de diagnóstico

### Novo script de diagnóstico
```bash
npm run diagnose

# Mostra:
# - Status do arquivo .env
# - Status das variáveis de ambiente
# - Teste de conexão com Supabase
# - Estrutura de pastas
# - Resumo final com recomendações
```

---

## 💡 DICAS

### Terminal do VS Code
```bash
# Se "npm" não funcionar no PowerShell:
# Use Git Bash ou Command Prompt em vez

# Ou abra como administrador:
# Clique direito no VS Code → "Run as Administrator"
```

### Verificar Porta
```bash
# Se porta 8000 está em uso:
netstat -ano | findstr :8000

# Mude em backend/.env:
PORT=8001
```

### Ver Logs Completos
```bash
# Abra backend/config/db.js e procure por:
console.log ou console.error

# Esses são os logs que vão aparecer no terminal
```

---

## 🎓 PRÓXIMAS AÇÕES

1. **Agora:** Execute `npm run diagnose`
2. **Veja o resultado** e siga o cenário correspondente
3. **Reinicie o servidor**
4. **Teste novamente**
5. **Se funcionar:** Continue desenvolvendo!
6. **Se não:** Copie a saída do diagnóstico e compartilhe

---

**Criado:** 06/02/2026  
**Para:** Resolução passo a passo do erro 500
