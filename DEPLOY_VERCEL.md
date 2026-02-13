# Deploy no Vercel - Blade Manager System

## Visão Geral

Seu projeto é fullstack (Vue + Node.js), então você precisará:
- **Frontend**: Deploy no Vercel (grátis, fácil)
- **Backend**: Deploy em outro serviço (Render, Railway, ou Heroku - recomendo Render ou Railway)

## Pré-requisitos

1. Conta no GitHub (push seu código lá)
2. Conta no Vercel (https://vercel.com)
3. Conta no Render ou Railway (para o backend)

---

## Passo 1: Preparar o Repositório GitHub

### 1.1 Criar repositório GitHub
```bash
git init
git add .
git commit -m "Initial commit - Blade Manager System"
git branch -M main
git remote add origin https://github.com/seu-usuario/seu-repo.git
git push -u origin main
```

### 1.2 Verificar que `.env` NÃO foi commitado (segurança!)
Verifique se `.env` está no `.gitignore` (deve estar):
```bash
cat .gitignore
```

Caso não esteja, adicione:
```
.env
.env.local
node_modules/
frontend/dist
```

---

## Passo 2: Deploy do Frontend no Vercel

### 2.1 Conectar ao Vercel
1. Acesse https://vercel.com/dashboard
2. Clique em "Add New... → Project"
3. Selecione "Import Git Repository"
4. Cole a URL do seu repositório GitHub: `https://github.com/seu-usuario/seu-repo.git`
5. Vercel fará o login automático no GitHub

### 2.2 Configurar Build Settings
Vercel deve detectar automaticamente:
- **Framework**: Vue.js
- **Build Command**: `npm run build`
- **Output Directory**: `frontend/dist`

Se não detectar, configure manualmente:
```
Build Command: cd frontend && npm run build
Output Directory: frontend
```

### 2.3 Configurar Variáveis de Ambiente
No painel do Vercel, vá para **"Settings → Environment Variables"** e adicione:

```
VITE_API_BASE=https://seu-backend-url.com/api
```

Substitua `seu-backend-url.com` pela URL do seu backend (você configurará na próxima seção).

### 2.4 Deploy
Clique em "Deploy" — Vercel fará build e publicará automaticamente.

**Resultado**: Seu frontend estará em `https://seu-projeto.vercel.app`

---

## Passo 3: Deploy do Backend (Render.com - Recomendado)

### 3.1 Preparar Backend para Deploy

Crie um arquivo `backend/Procfile` (Render lê isso):
```
web: node backend/server.js
```

Ou simplemente prepare um `backend/start.sh`:
```bash
#!/bin/bash
cd backend
npm start
```

### 3.2 Configurar package.json do Backend

Certifique-se que `backend/package.json` tem:
```json
{
  "name": "blade-manager-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "engines": {
    "node": "18"
  }
}
```

### 3.3 Criar Conta no Render

1. Acesse https://render.com
2. Clique em "New +" → "Web Service"
3. Selecione "Deploy an existing repository"
4. Conecte seu repositório GitHub

### 3.4 Configurar Web Service no Render

**Build Settings:**
- Build Command: `cd backend && npm install`
- Start Command: `node backend/server.js`
- Root Directory: `.` (raiz do repo)

**Environment Variables:**
Clique em "Add Environment Variable" e configure:

```
PORT=10000
JWT_SECRET=seu_valor_super_secreto_aleatorio
SUPABASE_URL=https://qoihvoikodeyhuqvjogt.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=blademanagersystem@gmail.com
EMAIL_PASS=pmzheklvlevnawov
APP_BASE_URL=https://seu-frontend.vercel.app
NODE_ENV=production
```

### 3.5 Deploy

Clique em "Create Web Service" — Render fará deploy automático.

**Resultado**: Seu backend estará em `https://seu-backend.onrender.com`

---

## Passo 4: Conectar Frontend ao Backend

### 4.1 Atualizar Variável de Ambiente no Vercel

1. Volte ao painel Vercel
2. Vá para **Settings → Environment Variables**
3. Atualize `VITE_API_BASE`:
```
VITE_API_BASE=https://seu-backend.onrender.com/api
```

### 4.2 Trigger Rebuild

No painel Vercel, clique em "Redeploy" para compilar o frontend com a nova variável.

---

## Passo 5: Testar Endpoints

Após deploy, teste se está funcionando:

```bash
# Testar backend
curl https://seu-backend.onrender.com/api/usuarios/profissionais/all \
  -H "Authorization: Bearer seu_token"

# Acessar frontend
https://seu-frontend.vercel.app
```

---

## Dicas Importantes

### Domain Personalizado
- **Vercel**: Vá para Settings → Domains e adicione seu domínio (ex: app.seudominio.com)
- **Render**: Similar — Settings → Custom Domain

### Auto-Deploy
Ambas plataformas fazem deploy automático quando você faz push no `main`:
```bash
git push origin main
# Vercel e Render detectam e fazem build automaticamente
```

### Monitorar Logs
- **Vercel**: Dashboard → Deployments → Logs
- **Render**: Dashboard → Service → Logs

### Secrets e Segurança
- **NUNCA** commite `.env` — use variáveis de ambiente no painel
- Para secrets críticos (senhas, chaves), use Secret Manager do Render/Vercel
- Rotacione `JWT_SECRET` periodicamente

---

## Alternativas para Backend

Se preferir outras plataformas em vez de Render:

### Railway.app (Fácil, gratuito até certo limite)
1. Acesse railway.app
2. "New Project" → Connect GitHub
3. Configure variáveis e deploy

### Heroku (Pago, mas confiável)
1. Criar app: `heroku create seu-app-name`
2. Deploy: `git push heroku main`

---

## Checklist Final

- [ ] Repositório GitHub criado e código pushed
- [ ] `.env` está no `.gitignore`
- [ ] Frontend buildado: `npm run build` (sem erros)
- [ ] Vercel conectado e deployed
- [ ] Backend em Render/Railway e deployed
- [ ] Variáveis de ambiente configuradas em ambas plataformas
- [ ] Teste login/endpoints funcionando
- [ ] HTTPS ativado (automático em Vercel e Render)

---

## Comandos Rápidos

```bash
# Build local para testar antes de subir
npm run build

# Testar build do frontend
npx serve frontend/dist

# Verificar variáveis de ambiente estão ok
cat backend/.env

# Ver status de deployments
git log --oneline
```

---

## Suporte

Se encontrar erros:
1. Verifique logs no painel de cada serviço
2. Teste backend localmente: `npm run dev`
3. Verifique CORS/variáveis de ambiente
4. Contate suporte Vercel/Render se necessário
