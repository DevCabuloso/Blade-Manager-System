# 🎯 ERRO 500 - SOLUÇÃO RÁPIDA

> **Seu servidor está retornando erro 500 ao tentar acessar /api/usuarios**

---

## ⚡ SOLUÇÃO (escolha uma)

### 🟢 Opção 1: Automática (Recomendada)
```bash
npm run diagnose
```
Siga as recomendações mostradas.

### 🟡 Opção 2: Passo a Passo
Leia: **GUIA_PASSO_A_PASSO.md**

### 🔴 Opção 3: Rápido (sem passos)
Leia: **FIX_ERRO_500.md**

---

## 🔧 VERIFICAÇÃO RÁPIDA

```bash
# 1. Verificar se .env existe
ls backend\.env

# Se NÃO existir:
cp backend\.env.example backend\.env

# 2. Verificar conteúdo (sem passwords)
cat backend\.env | grep SUPABASE

# Deve ter:
# SUPABASE_URL=https://qoihvoikodeyhuqvjogt.supabase.co
# SUPABASE_KEY=eyJ...

# 3. Reiniciar
npm run dev:backend
```

---

## ✅ APÓS RESOLVER

```bash
npm run dev
# Acesse http://localhost:5173
# Teste registro/login
```

---

**Documentação criada:** 06/02/2026

👉 **Próximo:** Execute `npm run diagnose`
