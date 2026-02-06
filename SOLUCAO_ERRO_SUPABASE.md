# 🔧 SOLUÇÃO - Erro de Conexão Supabase

**Erro:** `Failed to load resource: the server responded with a status of 500`  
**Causa:** `TypeError: fetch failed` - Problema de conexão com Supabase

---

## 🔍 DIAGNÓSTICO

Você está recebendo um erro **500 Internal Server Error** ao tentar acessar `/api/usuarios`. Isso acontece porque:

1. **O backend tenta conectar ao Supabase**
2. **A conexão falha com "fetch failed"**
3. **O servidor retorna erro 500**

---

## ✅ SOLUÇÕES (Tente em ordem)

### ✓ Solução 1: Verificar Variáveis de Ambiente (PRIMEIRO)

Seu arquivo `.env` está **OK** - contém as credenciais Supabase.

Mas verifique:

```bash
# 1. Certifique-se que o arquivo .env existe
# Localização: c:\Users\Usuario\Downloads\Blade-Manager-System-main\backend\.env

# 2. Verifique o conteúdo (não deve estar vazio)
# Deve ter:
# PORT=8000
# SUPABASE_URL=https://...
# SUPABASE_KEY=eyJ...
```

**Se estiver vazio ou incorreto:**
```bash
# Copie do arquivo .env.example
cp backend\.env.example backend\.env

# Depois preencha com os valores corretos
```

---

### ✓ Solução 2: Reiniciar o Backend

```bash
# 1. Pare o servidor atual (Ctrl+C no terminal)

# 2. Limpe o cache
rm -rf backend/node_modules
npm install --prefix backend

# 3. Inicie novamente
npm run dev

# OU apenas o backend
npm run dev:backend
```

---

### ✓ Solução 3: Verificar Conectividade de Rede

O erro `fetch failed` pode ser de **rede**. Teste:

```bash
# Verificar se consegue conectar ao Supabase
curl https://qoihvoikodeyhuqvjogt.supabase.co/rest/v1/

# Você deve receber uma resposta (pode ser um erro 401, mas significa que conseguiu conectar)
```

Se não conseguir, a **rede pode estar bloqueada**:
- Verifique firewall
- Verifique VPN (se estiver usando)
- Verifique proxy

---

### ✓ Solução 4: Atualizar Credenciais Supabase

Se as credenciais estiverem **expiradas ou incorretas**:

```bash
# 1. Vá para https://supabase.com
# 2. Faça login na sua conta
# 3. Selecione o projeto "qoihvoikodeyhuqvjogt"
# 4. Vá em Settings → API
# 5. Copie:
#    - Project URL
#    - anon/public key
# 6. Coloque no arquivo backend/.env:

SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-chave-aqui

# 7. Reinicie o servidor
```

---

### ✓ Solução 5: Verificar Estrutura do Banco

O erro pode acontecer se a **tabela "usuarios" não existe**:

```bash
# 1. Acesse https://supabase.com
# 2. Vá no seu projeto
# 3. No menu lateral, clique em "SQL Editor"
# 4. Execute este comando para criar a tabela:

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome_usuario VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  tipo_usuario VARCHAR(50) NOT NULL DEFAULT 'cliente',
  ativo INT DEFAULT 1,
  email_verificado BOOLEAN DEFAULT false,
  verification_token VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🛠️ TESTE RÁPIDO

Abra o arquivo `backend/config/db.js` e veja se printou algo no console:

```bash
# Procure no terminal por:
✅ "Conexão com o Supabase estabelecida!"
   → Problema está em outra coisa

❌ "Falha na conexão com o Supabase: TypeError: fetch failed"
   → Continue com as soluções acima
```

---

## 📋 CHECKLIST DE RESOLUÇÃO

- [ ] Arquivo `backend/.env` existe e tem as variáveis
- [ ] `SUPABASE_URL` está preenchido
- [ ] `SUPABASE_KEY` está preenchido
- [ ] Node.js está rodando (`node -v` retorna versão)
- [ ] npm está rodando (`npm -v` retorna versão)
- [ ] Não há firewall bloqueando supabase.co
- [ ] Tabela "usuarios" existe no Supabase
- [ ] Backend pode ser iniciado sem erros

---

## 🚀 APÓS RESOLVER

Depois de resolver o erro, teste:

```bash
# 1. Inicie o projeto
npm run dev

# 2. Vá para http://localhost:5173 no navegador

# 3. Tente se registrar ou fazer login

# 4. Console deve mostrar (não erro 500)
```

---

## 📞 SE AINDA NÃO FUNCIONAR

### Colete estas informações:

1. **Erro completo do terminal:**
   ```bash
   Copie e compartilhe toda a mensagem de erro
   ```

2. **Status do backend:**
   ```bash
   npm run dev:backend
   
   # Veja se printa:
   # ✅ "Servidor rodando em http://localhost:8000"
   # ✅ "Conexão com o Supabase estabelecida!"
   ```

3. **Acesse diretamente:**
   ```bash
   curl http://localhost:8000/api/usuarios/
   
   # Veja a resposta de erro
   ```

---

## 💡 DICAS

### Limpar Cache Completo
```bash
# 1. Delete node_modules
rm -r node_modules
rm -r backend/node_modules

# 2. Delete package-lock.json
rm package-lock.json
rm backend/package-lock.json

# 3. Reinstale tudo
npm install
cd backend && npm install && cd ..
```

### Verificar Portas
```bash
# Verifique se as portas estão livres
# Windows PowerShell:
netstat -ano | findstr :5173
netstat -ano | findstr :8000

# Se estiver usando (PID listado), feche aquele processo
```

### Ativar Logs Detalhados
```bash
# No arquivo backend/config/db.js, adicione:
console.log('SUPABASE_URL:', SUPABASE_URL);
console.log('SUPABASE_KEY:', SUPABASE_KEY ? '***' : 'não definido');
```

---

## 🎯 PRÓXIMAS AÇÕES

1. **AGORA:** Execute as soluções acima em ordem
2. **Se funcionar:** Continue desenvolvendo
3. **Se não funcionar:** Colete informações e reporte

---

**Documento criado:** 06 de Fevereiro de 2026  
**Para:** Solução de erro de conexão Supabase
