# ELN Finance — Web Version

## Estrutura do projeto
```
eln-finance/
├── backend/      → FastAPI (Python) — Railway
│   ├── main.py
│   ├── db_core.py     ← copie do projeto original (versão atualizada)
│   ├── requirements.txt
│   └── Procfile
└── frontend/     → React + Vite — Vercel
    ├── src/
    ├── package.json
    └── ...
```

---

## 1. Preparar o backend

1. Copie o `db_core.py` atualizado para a pasta `backend/`
2. Teste localmente:
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# Acesse: http://localhost:8000/docs
```

---

## 2. Deploy do backend no Railway

1. Acesse https://railway.app e crie uma conta gratuita
2. Clique em **New Project → Deploy from GitHub**
3. Conecte seu GitHub e suba a pasta `backend/` como repositório
4. O Railway detecta o `Procfile` e sobe automaticamente
5. Após o deploy, copie a URL gerada (ex: `https://eln-backend.up.railway.app`)

> ⚠️ O plano gratuito do Railway dá 500h/mês — suficiente para uso pessoal.

---

## 3. Configurar o frontend

Crie o arquivo `frontend/.env`:
```
VITE_API_URL=https://sua-url-do-railway.up.railway.app
```

Teste localmente:
```bash
cd frontend
npm install
npm run dev
# Acesse: http://localhost:5173
```

---

## 4. Deploy do frontend no Vercel

1. Acesse https://vercel.com e crie uma conta gratuita
2. Clique em **New Project → Import Git Repository**
3. Selecione a pasta `frontend/` do seu repositório
4. Em **Environment Variables**, adicione:
   - `VITE_API_URL` = URL do Railway
5. Clique em **Deploy**
6. Em 2 minutos o site estará no ar com URL do tipo `eln-finance.vercel.app`

---

## 5. Acesso pelo celular

Com o site no Vercel, basta abrir o link no navegador do celular.
Para ter ícone na tela inicial como um app:
- **Android (Chrome):** Menu → "Adicionar à tela inicial"
- **iPhone (Safari):** Compartilhar → "Adicionar à Tela de Início"

---

## Resumo de custos
| Serviço | Custo |
|---------|-------|
| Railway (backend) | Gratuito (500h/mês) |
| Vercel (frontend) | Gratuito |
| **Total** | **R$ 0,00** |
