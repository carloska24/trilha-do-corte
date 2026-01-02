---
description: Como conectar e visualizar o Banco de Dados (PostgreSQL)
---

# 🔌 Conectando ao Banco de Dados (PostgreSQL)

Como seu projeto usa um banco profissional (**PostgreSQL**) na nuvem (Supabase/Render), você não pode abrir o arquivo diretamente. Você precisa de um "Cliente SQL".

## Opção 1: Extensão "SQLTools" no VS Code (Recomendado)

Essa é a opção mais fácil, tudo dentro do VS Code.

1.  Abra a aba de **Extensões** do VS Code (`Ctrl+Shift+X`).
2.  Pesquise por **"SQLTools"** e instale a oficial.
3.  Instale também o driver **"SQLTools PostgreSQL/Cockroach Driver"**.
4.  Após instalar, vai aparecer um ícone de Banco de Dados na barra lateral esquerda.
5.  Clique em **"Add New Connection"**.
6.  Escolha **PostgreSQL**.
7.  Preencha os dados:
    - **Name:** `Trilha do Corte (Prod)`
    - **Connection String:** (Copie o valor de `DATABASE_URL` do seu arquivo `.env`)
      - _Dica: Começa com `postgres://...`_
8.  Clique em **"Save Connection"**.
9.  Clique em **"Connect"**.

Pronto! Agora você pode ver as tabelas `clients`, `appointments`, `services` e rodar queries.

---

## Opção 2: DBeaver (App Separado)

Se preferir um programa separado e mais poderoso.

1.  Baixe e instale o [DBeaver Community](https://dbeaver.io/download/).
2.  Abra o DBeaver e clique no ícone de tomada ("Nova Conexão").
3.  Selecione **PostgreSQL**.
4.  Vá na aba "URL" (em vez de preencher Host/Port separado).
5.  Cole sua `DATABASE_URL` do arquivo `.env`.
6.  Clique em "Finalizar".

## ⚠️ Cuidado Importante

Este é o banco de dados **de verdade**.

- Se você apagar um cliente aqui, ele some do site.
- Se alterar um agendamento, altera para o cliente.
- Use para **visualizar** e **conferir**. Evite alterar dados manualmente a menos que tenha certeza.
