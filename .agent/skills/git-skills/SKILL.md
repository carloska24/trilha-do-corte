---
name: Git Push - PowerShell Safe (Windows)
description: Executa status, commit e push no Windows PowerShell de forma segura (sem &&).
---

# Git Push - PowerShell Safe

Esta skill executa uma sequência segura de comandos git para Windows PowerShell, garantindo compatibilidade e evitando erros de sintaxe comuns em shells do Windows.

## Regras de Execução

- **Ambiente**: Windows PowerShell.
- **Segurança**: Não utilizar operadores de encadeamento como `&&` ou `||` que podem falhar dependendo da configuração do terminal.
- **Sequencialidade**: Executar um comando por vez.

## Comandos

1. **Verificar Estado Atual**
   Visualiza arquivos modificados e staged.

   ```powershell
   git status
   ```

2. **Verificar Remoto**
   Confirma para onde o código será enviado.

   ```powershell
   git remote -v
   ```

3. **Adicionar Arquivos**
   Adiciona todas as modificações ao stage.

   ```powershell
   git add .
   ```

4. **Commit**
   Realiza o commit com uma mensagem padrão (pode ser ajustada pelo usuário se solicitado, mas o padrão é "auto commit").

   ```powershell
   git commit -m "auto commit"
   ```

5. **Push**
   Envia as alterações para a branch main.
   ```powershell
   git push origin main
   ```
