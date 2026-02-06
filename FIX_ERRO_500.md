# 🚨 ERRO 500 - RESOLUÇÃO RÁPIDA

**Erro:** `Failed to load resource: 500 (Internal Server Error)`  
**Causa:** Conexão com Supabase falhando

---

## ⚡ RESOLUÇÃO EM 5 MINUTOS

### Passo 1: Diagnosticar o Problema
```bash
npm run diagnose
```

Isso vai mostrar:
- ✅ Se `.env` está configurado
- ✅ Se Supabase está acessível
- ✅ Se as variáveis de ambiente estão corretas

### Passo 2: Reiniciar o Servidor
```bash
# 1. Parar o servidor (Ctrl+C)

# 2. Limpar cache
rm -r backend/node_modules
npm install --prefix backend

# 3. Reiniciar
npm run dev:backend
```

### Passo 3: Testar de Novo
```
Abra: http://localhost:5173
Tente fazer login/registrar
```

---

## 🎯 SE AINDA NÃO FUNCIONAR

### ✓ Opção 1: Verificar Credenciais Supabase
```bash
# 1. Vá em: https://supabase.com
# 2. Selecione o projeto: qoihvoikodeyhuqvjogt
# 3. Vá em: Settings → API
# 4. Copie:
#    - Project URL
#    - anon/public key
# 5. Atualize em backend/.env
# 6. Reinicie o servidor
```

### ✓ Opção 2: Limpar Tudo e Reinstalar
```bash
# 1. Parar servidor (Ctrl+C)

# 2. Limpar completamente
rm -r node_modules backend/node_modules
rm package-lock.json backend/package-lock.json

# 3. Reinstalar
npm install
cd backend && npm install && cd ..

# 4. Rodar diagnóstico
npm run diagnose

# 5. Iniciar
npm run dev:backend
```

### ✓ Opção 3: Verificar Rede
```bash
# Teste se consegue acessar Supabase
curl https://qoihvoikodeyhuqvjogt.supabase.co/rest/v1/

# Deve retornar uma resposta (pode ser erro 401, mas significa que conectou)
```

Se o `curl` falhar:
- **Firewall está bloqueando** → Configure seu firewall
- **VPN bloqueando** → Desconecte VPN
- **Proxy interferindo** → Configure proxy se necessário

---

## 📝 CHECKLIST

- [ ] `.env` existe em `backend/`
- [ ] `SUPABASE_URL` está preenchido
- [ ] `SUPABASE_KEY` está preenchido
- [ ] Servidor reiniciado após editar `.env`
- [ ] Nenhum firewall bloqueando supabase.co
- [ ] Executar `npm run diagnose` passou

---

## 💻 COMANDOS ÚTEIS

```bash
# Ver logs detalhados
npm run dev:backend

# Apenas diagnosticar
npm run diagnose

# Limpar tudo
rm -r node_modules backend/node_modules package-lock.json backend/package-lock.json
npm install

# Testar conexão manualmente
curl https://qoihvoikodeyhuqvjogt.supabase.co/rest/v1/
```

---

## ❓ O QUE SIGNIFICA O ERRO

| Erro | Causa | Solução |
|------|-------|---------|
| `500 Internal Server Error` | Backend com erro | Ver logs do terminal |
| `TypeError: fetch failed` | Sem conexão com Supabase | Verificar rede/firewall |
| `401 Unauthorized` | Credenciais inválidas | Atualizar SUPABASE_KEY |
| `Failed to connect` | Firewall bloqueando | Configurar firewall |

---

## 🎉 DEPOIS DE RESOLVER

```bash
# Se funcionou, veja:
npm run dev

# Acesse:
# Frontend: http://localhost:5173
# Backend: http://localhost:8000
```

---

**Criado:** 06/02/2026  
**Para:** Resolução de erro 500 Supabase
