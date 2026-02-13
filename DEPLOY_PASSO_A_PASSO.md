# Deploy Vercel - Passo a Passo Completo (Iniciante)

## ⏰ Tempo Total: ~15 minutos

---

## PARTE 1: PREPARAR SEU CÓDIGO (5 minutos)

### PASSO 1.1: Instalar Git no seu PC
1. Acesse https://git-scm.com/download/win
2. Clique em "Download"
3. Execute o instalador
4. Clique "Next" até o final (use valores padrão)
5. Abra PowerShell e digite:
```bash
git --version
```
Se aparecer uma versão, Git está instalado! ✅

---

### PASSO 1.2: Configurar Git com seu nome e email
Abra PowerShell e execute:
```bash
git config --global user.name "Seu Nome Completo"
git config --global user.email "seu.email@gmail.com"
```

Exemplo:
```bash
git config --global user.name "João Silva"
git config --global user.email "joao@gmail.com"
```

---

### PASSO 1.3: Criar Repositório Localmente
Abra PowerShell, navegue até a pasta do projeto e execute:
```bash
cd C:\Users\Usuario\Downloads\Blade-Manager-System-main
git init
git add .
git commit -m "Versão inicial do Blade Manager"
```

Você verá algo como:
```
[main (root-commit) abc1234] Versão inicial do Blade Manager
 50 files changed, 5000 insertions(+)
```

✅ Seu código está pronto para Upload!

---

## PARTE 2: SUBIR CÓDIGO PARA GITHUB (2 minutos)

### PASSO 2.1: Criar Conta GitHub
1. Acesse https://github.com/signup
2. Preencha:
   - **Username**: seu_usuario_github (ex: joao-silva-dev)
   - **Email**: seu.email@gmail.com
   - **Password**: uma senha forte
3. Clique "Create account"
4. Verifique seu email (GitHub vai enviar um link)

---

### PASSO 2.2: Criar Novo Repositório no GitHub
1. Acesse https://github.com/new
2. Preencha:
   - **Repository name**: blade-manager (ou o nome que quiser)
   - **Description**: Sistema de agendamento para barbearias
   - **Public**: Deixe marcado (é grátis)
3. Clique "Create repository"

Você verá uma tela com comandos no final da página.

---

### PASSO 2.3: Enviar Código para GitHub
Copie os comandos da tela e execute no PowerShell. Será algo como:

```bash
git branch -M main
git remote add origin https://github.com/seu-usuario/blade-manager.git
git push -u origin main
```

Coloque sua senha do GitHub quando pedir.

✅ Seu código está agora no GitHub!

Você pode verificar acessando: https://github.com/seu-usuario/blade-manager

---

## PARTE 3: DEPLOY DO FRONTEND NO VERCEL (4 minutos)

### PASSO 3.1: Criar Conta Vercel
1. Acesse https://vercel.com/signup
2. Clique em "Continue with GitHub"
3. Autorize Vercel a acessar suas contas
4. Preencha as informações solicitadas

---

### PASSO 3.2: Importar Projeto no Vercel
1. Acesse https://vercel.com/dashboard
2. Clique em **"Add New..."**
3. Selecione **"Project"**
4. Clique em **"Import Git Repository"**
5. Cole a URL do seu repositório:
```
https://github.com/seu-usuario/blade-manager
```
6. Clique **"Import"**

---

### PASSO 3.3: Configurar Build Settings
A tela mostrará opções. Configure assim:

| Campo | Valor |
|-------|-------|
| **Framework Preset** | Vue.js |
| **Build Command** | `npm run build` |
| **Output Directory** | `frontend/dist` |
| **Install Command** | `npm install` |

*Vercel pode detectar automaticamente, se sim, deixe como está.*

---

### PASSO 3.4: Adicionar Variáveis de Ambiente
1. Clique em **"Environment Variables"**
2. Clique **"Add New"**
3. Preencha:
   - **Name**: `VITE_API_BASE`
   - **Value**: `http://localhost:8000/api` (por enquanto, vamos atualizar depois)
4. Clique **"Add"**

A tela ficará assim:
```
VITE_API_BASE = http://localhost:8000/api
```

---

### PASSO 3.5: Iniciar Deploy
1. Clique **"Deploy"**
2. Vercel vai compilar seu código (leva ~1-2 minutos)
3. Quando terminar, aparecerá:
```
✅ Production: Ready
```

Clique em **"Visit"** para ver seu site online!

**Sua URL será**: `https://blade-manager.vercel.app` (ou similar)

✅ Frontend está deployado!

---

## PARTE 4: DEPLOY DO BACKEND NO RENDER (6 minutos)

### PASSO 4.1: Criar Conta Render
1. Acesse https://render.com
2. Clique **"Sign Up"**
3. Selecione **"Sign up with GitHub"**
4. Clique **"Authorize"**

---

### PASSO 4.2: Criar Web Service
1. Clique no botão **"New +"** (canto superior direito)
2. Selecione **"Web Service"**
3. Clique **"Connect account"** (conecta seu GitHub)
4. Procure e selecione seu repositório **"blade-manager"**
5. Clique **"Connect"**

---

### PASSO 4.3: Configurar Build Settings
Preencha os campos assim:

| Campo | Valor |
|-------|-------|
| **Name** | `blade-manager-backend` |
| **Environment** | `Node` |
| **Plan** | `Free` |
| **Build Command** | `cd backend && npm install` |
| **Start Command** | `node backend/server.js` |
| **Root Directory** | `.` |

---

### PASSO 4.4: Adicionar Variáveis de Ambiente
Scroll para baixo até **"Environment Variables"**.

Clique **"Add Environment Variable"** e preencha CADA UM:

```
PORT = 10000
NODE_ENV = production
JWT_SECRET = seu_valor_super_seguro_aleatorio_32_caracteres
SUPABASE_URL = https://qoihvoikodeyhuqvjogt.supabase.co
SUPABASE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvaWh2b2lrb2RleWh1cXZqb2d0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NDE4NzYsImV4cCI6MjA3NzAxNzg3Nn0.J71wfq4oCwpdw7oxcpl8fr_uhge8hSU0QaVP6ZvZYog
EMAIL_HOST = smtp.gmail.com
EMAIL_USER = blademanagersystem@gmail.com
EMAIL_PASS = pmzheklvlevnawov
APP_BASE_URL = https://blade-manager.vercel.app
```

**Onde encontrar cada valor:**
- `SUPABASE_URL` e `SUPABASE_KEY`: copie do seu `backend/.env` local
- `EMAIL_USER` e `EMAIL_PASS`: copie do seu `backend/.env` local
- `JWT_SECRET`: crie uma senha aleatória (veja instrução abaixo)
- `APP_BASE_URL`: use a URL do seu Vercel (https://blade-manager.vercel.app)

**Como gerar JWT_SECRET seguro:**
Abra PowerShell e execute:
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```
Copie o resultado e cole em `JWT_SECRET`

---

### PASSO 4.5: Iniciar Deploy
1. Clique **"Create Web Service"** (botão roxo em baixo)
2. Render vai:
   - Instalar dependências (~30 segundos)
   - Compilar código (~30 segundos)
   - Iniciar servidor (alguns segundos)
3. O dashboard mostrará:
```
✓ Your service is live
```

Quando estiver verde, copie a URL. Será algo como:
```
https://blade-manager-backend.onrender.com
```

✅ Backend está deployado!

---

## PARTE 5: CONECTAR FRONTEND AO BACKEND (2 minutos)

### PASSO 5.1: Atualizar URL do Backend no Vercel
1. Volte ao Vercel (https://vercel.com/dashboard)
2. Clique no seu projeto **"blade-manager"**
3. Vá para **"Settings"** (em cima)
4. Clique **"Environment Variables"** (menu esquerdo)
5. Encontre `VITE_API_BASE`
6. Clique no ícone de editar (lápis)
7. Mude o valor para:
```
https://blade-manager-backend.onrender.com/api
```
8. Clique **"Save"**

---

### PASSO 5.2: Triggerar Rebuild
1. Volte para **"Deployments"** (abas em cima)
2. Clique nos **"3 pontinhos"** (...) do último deploy
3. Selecione **"Redeploy"**
4. Aguarde concluir (~2 minutos)

Quando estiver pronto, mostrará:
```
✅ Production: Ready
```

✅ Frontend reconectado ao backend!

---

## PARTE 6: TESTAR TUDO (1 minuto)

### PASSO 6.1: Acessar o Site
1. Acesse sua URL Vercel:
```
https://blade-manager.vercel.app
```

2. Você deve ver a página de login

3. **Teste login:**
   - Email: use uma conta que você criou localmente
   - Senha: a senha que você criou
   - Clique "Entrar"

Se funcionar, verá o dashboard! ✅

### PASSO 6.2: Se Não Funcionar
Se aparecer erro, verifique:

**Erro de conexão/timeout:**
- Render pode estar dormindo (plano free)
- Acesse `https://blade-manager-backend.onrender.com/api/usuarios/profissionais/all` no navegador
- Se demorar muito, é normal (Render wake time ~1 minuto)

**Erro 401 (Unauthorized):**
- Token expirou ou credenciais incorretas
- Clique "Criar conta" e faça um novo registro

**Erro 500:**
- Logs do backend: Vá para Render → Dashboard → Seu serviço → "Logs"
- Me mostre o erro exato

---

## ✅ CHECKLIST FINAL

- [ ] GitHub repositório criado com código
- [ ] Vercel deployment feito (frontend online)
- [ ] Render deployment feito (backend online)
- [ ] `VITE_API_BASE` atualizado no Vercel
- [ ] Frontend redeploy feito
- [ ] Login funcionando
- [ ] Você consegue acessar dashboard após login

**Se tudo estiver com ✅, parabéns! Sistema está online! 🚀**

---

## 📞 PRÓXIMAS ETAPAS (Opcional)

### Domínio Personalizado
- Ao invés de `blade-manager.vercel.app`, use seu próprio domínio
- Vercel: Settings → Domains → Add
- Render: Settings → Custom Domain

### Auto-Deploy
- Sempre que você faz `git push` no GitHub, Vercel e Render fazem rebuild automático
- O site atualiza em ~2-3 minutos

### Monitorar Erros
- **Vercel**: Dashboard → Seu projeto → "Logs"
- **Render**: Dashboard → Seu serviço → "Logs"

---

## 🆘 ERROS COMUNS

| Erro | Solução |
|------|---------|
| "Cannot find module X" | Necessário fazer rebuild. Va em Vercel/Render e clique Redeploy |
| "Port 8000 already in use" | Esperado localmente, Render escolhe porta automaticamente |
| Email não enviando | Verifique `EMAIL_PASS` se é App Password do Gmail |
| 404 em rotas SPA | Verifique se `vercel.json` está correto |
| Supabase não conecta | Verifique `SUPABASE_URL` e `SUPABASE_KEY` |

---

Se tiver dúvida em qualquer passo, me fale qual passo exato está preso!
