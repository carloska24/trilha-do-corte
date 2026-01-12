# 📦 Scripts Arquivados

Esta pasta contém scripts de **desenvolvimento, debug e migração** que não são necessários para a operação do sistema em produção. Eles foram movidos para cá para manter a pasta principal do servidor limpa e organizada.

## ⚠️ Aviso

Estes scripts podem ter dependências desatualizadas ou não funcionar corretamente sem ajustes. Use com cautela.

---

## 📂 Categorias

### 🐛 Debug (5 arquivos)

Scripts para diagnóstico e troubleshooting:

- `debug-env.js` - Verifica variáveis de ambiente
- `debug_api.js` - Testa endpoints da API
- `debug_db.js` - Debug de conexão com banco
- `debug_login.js` - Debug do fluxo de login
- `debug_prisma.ts` - Debug do cliente Prisma

### 🔄 Migração (7 arquivos)

Scripts de migração de schema:

- `migrate_add_badges.js` - Adiciona campo badges
- `migrate_add_constraints.js` - Adiciona constraints
- `migrate_add_indexes.js` - Adiciona índices
- `migrate_barber_phone.js` - Adiciona telefone do barbeiro
- `migrate_clientid.js` - Migra clientId
- `migrate_passwords.js` - Migra senhas para bcrypt
- `migration_add_category_safe.js` - Adiciona categoria

### 🔧 Fix (4 arquivos)

Scripts para correção de dados:

- `fix_conflicts.js` - Resolve conflitos de agendamento
- `fix_null_client_ids.js` - Corrige clientIds nulos
- `fix_null_status.js` - Corrige status nulos
- `fix_services_categorized.js` - Categoriza serviços

### 🌱 Seed (5 arquivos)

Scripts para popular o banco com dados de teste:

- `seed-production.js` - Dados de produção
- `seed_full.js` - Dataset completo
- `seed_queue_test.js` - Dados para teste de fila
- `seed_rich_data.js` - Dados enriquecidos
- `seed_smart_appointment.js` - Agendamentos inteligentes

### 🔍 Audit (4 arquivos)

Scripts de auditoria:

- `audit_images.js` - Audita imagens
- `audit_integrity.js` - Verifica integridade
- `audit_routes.js` - Audita rotas da API
- `audit_sql.js` - Audita queries SQL

### 🔄 Reset/Restore (6 arquivos)

Scripts para reset e restauração:

- `reset_db.js` - Reseta banco de dados
- `reset_passwords.js` - Reseta senhas
- `reset_schedule.ts` - Reseta agenda
- `reseed_services.js` - Repopula serviços
- `restore_basic_services.js` - Restaura serviços básicos
- `restore_full_services.js` - Restaura serviços completos

### 🧪 Test/Verify (10 arquivos)

Scripts de teste e verificação:

- `add_clients.js` - Adiciona clientes de teste
- `check_columns.js` - Verifica colunas
- `check_constraints.js` - Verifica constraints
- `check_path.js` - Verifica paths
- `diagnose_appointments.js` - Diagnostica agendamentos
- `update_services_schema.js` - Atualiza schema de serviços
- `verify-db.js` - Verifica banco
- `verify_schema.js` - Verifica schema
- `test_api.js` - Testa API
- `test-cloudinary-conn.js` - Testa conexão Cloudinary

---

## 📌 Como Usar

Para executar qualquer script, navegue até a pasta principal do projeto e rode:

```bash
node server/_archived/NOME_DO_SCRIPT.js
```

Para scripts TypeScript:

```bash
npx tsx server/_archived/NOME_DO_SCRIPT.ts
```

---

_Arquivado em: 12 de Janeiro de 2026_
