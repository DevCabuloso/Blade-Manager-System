# 🚀 Guia Rápido de Início - Blade Manager System

## ✅ Status do Projeto
**Todos os erros foram identificados e corrigidos!** O projeto agora está alinhado e pronto para desenvolvimento.

---

## 📦 Instalação Rápida

### 1. Clonar/Preparar o Projeto
```bash
cd c:\Users\Usuario\Downloads\Blade-Manager-System-main
npm install
cd backend
npm install
cd ..
```

### 2. Configurar Variáveis de Ambiente
```bash
# Backend - Copie o arquivo de exemplo
cp backend\.env.example backend\.env

# Edite backend\.env com suas credenciais (já possui alguns valores padrão)
```

### 3. Iniciar o Projeto

#### Opção A: Modo Desenvolvimento (Recomendado)
```bash
npm run dev
```
Isto abrirá:
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:8000

#### Opção B: Iniciar Manualmente
```bash
# Terminal 1 - Frontend
npm install
npx vite

# Terminal 2 - Backend
cd backend
npm install
node server.js
```

---

## 🎯 Fluxo de Uso

### 1️⃣ **Cliente - Agendar Corte**
```
Home → Login/Registro → Selecionar Profissional → Escolher Serviço → 
Agendar Data/Hora → Confirmar
```

### 2️⃣ **Barbeiro - Gerenciar Agenda**
```
Login (tipo: barbeiro) → Dashboard → Visualizar Agendamentos → 
Gerenciar Serviços → Definir Horários
```

### 3️⃣ **Admin - Painel Administrativo**
```
Login (tipo: admin) → Painel Administrativo → Gerenciar Usuários/Barbearias/Relatórios
```

---

## 📝 Tipos de Usuário

| Tipo | Email | Senha | Permissões |
|------|-------|-------|------------|
| **Cliente** | qualquer@email.com | qualquer | Agendar serviços, visualizar perfil |
| **Barbeiro** | barbeiro@email.com | qualquer | Gerenciar agenda, serviços, horários |
| **Admin** | admin@email.com | qualquer | Gerenciar tudo, relatórios |

---

## 🔐 Credenciais Padrão (Dev)

**Backend** (`backend/.env`):
```
PORT=8000
JWT_SECRET=seu_segredo
SUPABASE_URL=https://qoihvoikodeyhuqvjogt.supabase.co
SUPABASE_KEY=[já configurado]
EMAIL_USER=blademanagersystem@gmail.com
EMAIL_PASS=[já configurado]
APP_BASE_URL=http://localhost:5173
NODE_ENV=development
```

⚠️ **NUNCA use estas credenciais em produção!**

---

## 🛠️ Scripts Disponíveis

```bash
# Frontend + Backend juntos
npm run dev

# Apenas Frontend
npx vite

# Apenas Backend
npm run dev:backend

# Build para produção
npm run build

# Preview do build
npm run serve

# Setup completo (deps + instala backend)
npm run setup
```

---

## 🗄️ Banco de Dados (Supabase)

### Tabelas Esperadas:
- `usuarios` - Dados de usuários
- `servicos` - Serviços oferecidos por barbeiros
- `agendamentos` - Agendamentos realizados
- `horarios_funcionamento` - Horários de funcionamento

Todos os dados estão em **Supabase** (https://supabase.co).

---

## 🐛 Troubleshooting

### ❌ "Erro de conexão com backend"
```bash
# Verifique se backend está rodando
npm run dev:backend
# Ou acesse: http://localhost:8000
```

### ❌ "Erro ao registrar usuário"
```bash
# Verifique email de verificação
# Cheque se APP_BASE_URL está correto em .env
```

### ❌ "Módulo não encontrado"
```bash
# Reinstale dependências
rm -r node_modules
npm install
cd backend && npm install && cd ..
```

### ❌ "Porta já em uso"
```bash
# Mude a porta em vite.config.js ou backend/.env
# Ou mate o processo atual
```

---

## 📚 Estrutura do Projeto

```
Blade-Manager-System/
├── backend/                    # API Express.js
│   ├── config/                # Configurações (DB, Email)
│   ├── controllers/           # Lógica das rotas
│   ├── middlewares/           # Autenticação, validação
│   ├── routes/                # Definição de rotas
│   ├── server.js              # Inicializador
│   ├── package.json           # Deps do backend
│   └── .env                   # Variáveis de ambiente
│
├── frontend/                  # Vue.js 3
│   ├── components/            # Componentes reutilizáveis
│   ├── pages/                 # Páginas/Rotas
│   ├── router/                # Configuração do Vue Router
│   ├── main.js                # Inicializador
│   └── App.vue                # Componente raiz
│
├── vite.config.js             # Configuração do Vite
├── tailwind.config.js         # Tailwind CSS
├── package.json               # Deps do frontend
└── index.html                 # HTML base
```

---

## 🔍 Erros Corrigidos (Ver `CORRECOES_IMPLEMENTADAS.md`)

✅ horariosController - Pool → Supabase  
✅ serviceController - Função incompleta  
✅ server.js - Ponto e vírgula  
✅ Login.vue - Tipo de usuário  
✅ Register.vue - Campo usuarios_id  
✅ Routes - Middleware de autenticação  
✅ .env.example - Documentação  
✅ vite.config.js - Configuração build  
✅ Registro - Expectativa de token  

---

## 📞 Suporte

Para mais informações:
- 📖 Veja: `DOCUMENTACAO_PROJETO.md`
- 🔧 Veja: `CORRECOES_IMPLEMENTADAS.md`
- 🐙 GitHub: [Seu repositório]

---

**Projeto pronto para uso! 🎉**
