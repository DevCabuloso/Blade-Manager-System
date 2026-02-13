# Deploy Vercel - Resumo Prático (5 minutos)

## Resumo em 5 Passos

### 1. Push para GitHub
```bash
cd C:\Users\Usuario\Downloads\Blade-Manager-System-main
git init
git add .
git commit -m "Blade Manager System"
git branch -M main
git remote add origin https://github.com/seu-usuario/seu-repo.git
git push -u origin main
```

### 2. Deploy Frontend no Vercel (3 minutos)
1. Acesse https://vercel.com/dashboard
2. Clique "Add New" → "Project"
3. "Import Git Repository" → cola sua URL GitHub
4. Settings → Environment Variables → Nova variável:
   ```
   VITE_API_BASE=https://seu-backend.onrender.com/api
   ```
5. Clique "Deploy"
6. Pronto! Seu frontend está em `https://seu-projeto.vercel.app`

### 3. Deploy Backend no Render (3 minutos)
1. Acesse https://render.com
2. Clique "New" → "Web Service"
3. "Build and deploy from a Git repository"
4. Conecta ao seu repo GitHub
5. Preenche:
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `node backend/server.js`
6. Clica "Advanced" e adiciona **Environment Variables**:
   ```
   PORT=10000
   NODE_ENV=production
   JWT_SECRET=seu_valor_aleatorio_super_seguro_aqui
   SUPABASE_URL=https://qoihvoikodeyhuqvjogt.supabase.co
   SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   EMAIL_HOST=smtp.gmail.com
   EMAIL_USER=blademanagersystem@gmail.com
   EMAIL_PASS=pmzheklvlevnawov
   APP_BASE_URL=https://seu-projeto.vercel.app
   ```
7. Clica "Create Web Service"
8. Pronto! Backend estará em `https://seu-backend.onrender.com`

### 4. Atualizar Frontend com URL do Backend
1. Volte ao painel Vercel
2. Settings → Environment Variables
3. Atualize `VITE_API_BASE` para:
   ```
   VITE_API_BASE=https://seu-backend.onrender.com/api
   ```
4. Vai auto-redeploy em alguns segundos

### 5. Testar
- Acesse https://seu-projeto.vercel.app
- Tente login/registro
- Tudo funcionando? ✅ Parabéns!

---

## Variáveis de Ambiente a Usar

**Frontend (VITE_API_BASE):**
- Desenvolvimento local: `http://localhost:8000/api`
- Produção (Vercel): `https://seu-backend.onrender.com/api`

**Backend (no Render painel ou arquivo .env):**
- `SUPABASE_URL` — copie de backend/.env atual
- `SUPABASE_KEY` — copie de backend/.env atual
- `EMAIL_USER`, `EMAIL_PASS` — mesmo do seu .env atual
- `APP_BASE_URL` — URL da sua aplicação frontend (ex: https://seu-projeto.vercel.app)
- `JWT_SECRET` — gere um novo seguro (mínimo 32 caracteres)

---

## Gerar JWT_SECRET Seguro

Abra Windows PowerShell e execute:
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

Copie o resultado e use no `JWT_SECRET` do Render.

---

## Troubleshooting Rápido

### Frontend mostra erro 404 ao acessar rotas
- Vercel precisa de `vercel.json` para redirecionar SPA

Crie arquivo na raiz:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "frontend/dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Commita e faz push: `git add vercel.json && git commit -m "Add Vercel config" && git push`

### Backend não conecta ao Supabase
- Verifique se `SUPABASE_URL` e `SUPABASE_KEY` foram copiolados correto no Render
- Teste localmente: `npm run dev` — se funcionar lá, deve funcionar no Render

### Email não sendo enviado
- Verifique `EMAIL_USER`, `EMAIL_PASS` no Render
- Gmail pode exigir "App Password" (não senha normal)
- Gere em: https://myaccount.google.com/apppasswords

---

## Depois do Deploy

**CI/CD Automático:**
- Sempre que fazer `git push origin main`, Vercel e Render fazem auto-rebuild
- Leva ~2-3 minutos para estar online

**Monitorar Erros:**
- Vercel: Dashboard → clique no deployment → Logs
- Render: Dashboard → Service → Logs

**Domínio Personalizado:**
- Vercel: Settings → Domains → Adicione seu domínio
- Render: Settings → Custom Domain

---

## Checklist Antes de Publicar

- [ ] Código está no GitHub main branch
- [ ] `.env` está no `.gitignore` (não commitado)
- [ ] Frontend buildado localmente sem erro: `npm run build`
- [ ] Vercel deployment feito
- [ ] Render deployment feito
- [ ] `VITE_API_BASE` configurado em Vercel
- [ ] `APP_BASE_URL` configurado em Render
- [ ] Teste login funcionando
- [ ] Email de verificação funcionando

---

## URLs Finais

- **Frontend**: https://seu-projeto.vercel.app
- **Backend API**: https://seu-backend.onrender.com/api
- **Login**: https://seu-projeto.vercel.app/login
- **Compartilhar link profissional**: https://seu-projeto.vercel.app/?profissionalId=123

Pronto! Sistema está online! 🚀
