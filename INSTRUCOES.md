# 🚀 Como Iniciar o Sistema (Full Stack)

Este projeto possui dois servidores que precisam rodar juntos:

1.  **Backend (API):** Conecta no banco de dados. (Porta 3000)
2.  **Frontend (Interface):** Sua tela visual. (Porta 5173)

## ✅ A Maneira Fácil (Recomendada)

Criamos um comando especial que liga **os dois ao mesmo tempo**.

1.  Abra o terminal no VS Code (menu `Terminal` -> `New Terminal` ou `Ctrl + '`).
2.  Digite o comando abaixo e aperte Enter:

```bash
npm run dev:full
```

3.  Aguarde aparecer as mensagens de "Server running" e "Local: http://localhost:5173".
4.  Pronto! Pode abrir o navegador.

---

## 🛠️ A Maneira Manual (Separada)

Se preferir (ou se der erro no automático), você pode abrir dois terminais separados:

**Terminal 1 (Backend):**

```bash
npm run server
```

**Terminal 2 (Frontend):**

```bash
npm run dev
```

## 🛑 Como Parar

Para desligar, vá no terminal onde o sistema está rodando e aperte:
**Ctrl + C**
E confirme com **S** (ou Y) se pedir.
