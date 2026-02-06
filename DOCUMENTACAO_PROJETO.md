# Documentação geral do projeto BladeManager

> Documentação gerada automaticamente com leitura do repositório.

## Visão geral

BladeManager é uma aplicação web para agendamento de serviços (ex.: barbearias). É uma aplicação fullstack com frontend em Vue 3 + Vite e backend em Node.js/Express que usa Supabase como banco de dados (Postgres gerenciado). O projeto inclui suporte a uploads, autenticação por JWT e uma API REST para usuários, serviços e agendamentos.

## Tech stack

- Frontend: Vue 3, Vite, Vue Router, Tailwind CSS
- Backend: Node.js, Express.js
- Banco: Supabase (Postgres) via biblioteca `@supabase/supabase-js`
- Autenticação: JWT (biblioteca `jsonwebtoken`) e `bcrypt` para hashing de senhas
- Outras: multer (uploads), nodemon, concurrently
- Empacotamento/implantação: Docker (há Dockerfiles no frontend/backend) e `docker-compose.yml`

## Arquitetura e estrutura de pastas (resumo)

Raiz do projeto:

- `backend/` - código e servidor Express
  - `server.js` - entrada do servidor (CORS, static, rotas, CSP, logging)
  - `config/db.js` - cliente Supabase configurado (lê variáveis de ambiente)
  - `controllers/` - lógica das rotas (usuários, serviços, agendamentos)
  - `routes/` - definições de rotas (userRoutes, serviceRoutes, appointmentRoutes)
  - `middlewares/` - middlewares (ex.: `authMiddleware.js` para verificar JWT)
  - `Uploads/` - arquivos enviados
  - `package.json` - dependências do backend
- `frontend/` - app Vue 3 + Vite
  - `main.js`, `App.vue`, `router/index.js` etc.
  - `pages/`, `components/` - telas e componentes
  - `assets/` - CSS, imagens
  - `Dockerfile` - build do frontend
- `supabaseClient.js` - cliente supabase usado (conteúdo público no repo; atenção a chaves)
- `Dockerfile`, `docker-compose.yml` - orquestração multi-container
- `package.json` (raiz) - scripts para rodar em desenvolvimento (`dev` executa vite + nodemon)

## Endpoints principais (API)

Base: `http://localhost:8000` (padrão, backend roda na porta 8000)
Prefixo API: `/api`

- Usuários (`/api/usuarios`)
  - POST `/api/usuarios/register` — criar usuário (registerUser)
  - POST `/api/usuarios/login` — login e retorno de token (loginUser)
  - GET `/api/usuarios/:id` — obter dados do usuário (getUser)
  - PUT `/api/usuarios/:id` — atualizar usuário (updateUser)
  - DELETE `/api/usuarios/:id` — excluir usuário (deleteUser)
  - GET `/api/usuarios/profissionais` (ou similar) — listar profissionais (getAllProfessionals)
  - POST `/api/usuarios/:id/suspend` / enable — endpoints de gestão (suspendUser/enableUser)

- Serviços (`/api/servicos`)
  - GET `/api/servicos/:profissionalId` — listar serviços de um profissional (getServices)
  - POST `/api/servicos` — criar serviço (createService)
  - PUT `/api/servicos/:id` — atualizar serviço (updateService)
  - DELETE `/api/servicos/:id` — excluir serviço (deleteService)

- Agendamentos (`/api/agendamentos`)
  - GET `/api/agendamentos` — lista agendamentos do usuário autenticado (getAppointments)
  - POST `/api/agendamentos` — criar agendamento (createAppointment)
  - GET `/api/agendamentos/:barbeiroId/:data` — obter horários ocupados do barbeiro na data (getAppointmentsByDate)

Observações:
- A maioria das rotas que alteram dados requer autenticação via JWT; o middleware `authMiddleware.js` aplica a validação e injeta `req.user`.
- Controllers usam o cliente Supabase (`backend/config/db.js`) para operações no banco.

## Banco de dados / Supabase

- O projeto usa Supabase (Postgres). As tabelas esperadas (pelo código) incluem pelo menos:
  - `usuarios` (campos: id, nome_usuario, email, senha, telefone, tipo_usuario, ativo, ...)
  - `servicos` (campos: id, nome, preco, duracao_minutos, barbeiro_id)
  - `agendamentos` (campos: id, cliente_id, barbeiro_id, servico_id, data_hora, status)

- As credenciais e URL do Supabase são carregadas a partir de variáveis de ambiente. O arquivo `backend/config/db.js` carrega `SUPABASE_URL` e `SUPABASE_KEY` (procure-os em `backend/.env` ou no `.env` na raiz conforme configuração).

- Atenção: há um arquivo `supabaseClient.js` no root contendo uma URL e uma chave pública (anon). Garanta que chaves sensíveis não estejam expostas no repo.

## Variáveis de ambiente (principais)

No `backend/.env` (ou `.env` referenciado por `server.js`):

- SUPABASE_URL — URL do projeto Supabase
- SUPABASE_KEY — chave (service/anon conforme uso)
- JWT_SECRET — segredo para assinar tokens JWT
- PORT — (opcional) porta do servidor (padrão 8000)

Verifique `backend/server.js` e `backend/config/db.js` para confirmações.

## Como rodar em desenvolvimento (local)

Recomendações (PowerShell / Windows):

1) Instalar dependências

```powershell
# Na raiz (para dev que usa concurrently com frontend+backend)
npm install
# Em seguida instalar dependências do backend (opcional, pois se rodar npm install na raiz pode já conter as dependências do frontend)
cd backend
npm install
cd ..
```

2) Criar/atualizar variáveis de ambiente

- Criar `backend/.env` com as chaves: SUPABASE_URL, SUPABASE_KEY, JWT_SECRET, PORT (opcional).

3) Rodar em modo desenvolvimento

```powershell
# Na raiz
npm run dev
# Isso executa Vite (frontend) e nodemon (backend/server.js) simultaneamente
```

Alternativa com Docker:

- Se quiser rodar containers, existe `docker-compose.yml` e Dockerfiles no frontend/backend — use `docker-compose up --build`.

## Build / Produção

- Frontend: `npm run build` (na raiz). O build é colocado em `frontend/dist` — o backend serve arquivos estáticos dessa pasta se existir.
- Backend: pode ser executado via `node backend/server.js` (ou container Docker). Confirme variáveis de ambiente de produção.

## Observações de segurança e pontos a revisar

- Evite commitar chaves sensíveis (`SUPABASE_KEY`, `JWT_SECRET`) no repositório. Substitua a chave exposta em `supabaseClient.js` por uma referência a variáveis de ambiente ou remova do repositório.
- Revise a política CSP em `backend/server.js` para ambientes de produção (atualmente permite `unsafe-inline`/`unsafe-eval` em scripts/styles — suficiente para dev, mas arriscado em produção).
- As rotas de deleção (`deleteUser`) removem serviços e agendamentos associados; confirmar constraints no banco para evitar inconsistências.
- Tests automatizados não encontrados — adicionar testes unitários/integrados seria recomendável.

## Arquivos importantes para manutenção

- `backend/server.js` — inicialização, CORS, CSP, rotas e static
- `backend/config/db.js` — cliente Supabase e função de teste de conexão
- `backend/controllers/*.js` — regras de negócio
- `backend/middlewares/authMiddleware.js` — validação do JWT (verifique se já existe e como lida com erros)
- `frontend/router/index.js` — regras de rota e proteção (sessionStorage usada)
- `supabaseClient.js` — cliente Supabase em root (verificar uso e chaves)

## Sugestões / próximos passos

- Remover chaves sensíveis do repo e usar variáveis de ambiente (ou serviços secretos CI/CD).
- Adicionar documentação de API (ex.: OpenAPI / Swagger) para facilitar consumo do frontend e terceiros.
- Adicionar testes (backend controllers e rotas) e CI básico (GitHub Actions) para garantir integridade.
- Considerar migração de logs para formato estruturado e adicionar níveis (info/warn/error).

## Contato

Se quiser, eu posso:
- Gerar um arquivo OpenAPI/Swagger básico a partir das rotas encontradas.
- Adicionar um exemplo de `.env.example` e um script de setup.
- Verificar e remover chaves sensíveis do repo e substituí-las por um pattern seguro.

---

_Arquivo gerado automaticamente — `DOCUMENTACAO_PROJETO.md`_
