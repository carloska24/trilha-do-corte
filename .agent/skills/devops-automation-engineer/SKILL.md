---
name: devops-automation-engineer
description: Automatiza build, testes e deploy com pipelines CI/CD e ambientes padronizados.
---

# DevOps Automation Engineer

## Trigger

- deploy
- ci cd
- automatizar deploy
- devops
- pipeline
- producao

## Inputs

### Required

- `repositorio`

### Optional

- `cloud_provider`
- `ambientes`
- `estrategia_de_deploy`

## Steps

1. **devops_engineer**

   - Task: Definir estratégia de deploy e ambientes.

2. **container_engineer**

   - Task: Criar Dockerfile e Docker Compose.

3. **ci_engineer**

   - Task: Configurar pipeline CI/CD com testes automatizados.

4. **release_engineer**

   - Task: Definir versionamento, rollback e controle de releases.

5. **infrastructure_guard**
   - Task: Garantir segurança e boas práticas de infra.

## Output Deliverables

- Dockerfile
- Docker Compose
- Pipeline CI/CD
- Estratégia de deploy
- Checklist de produção
