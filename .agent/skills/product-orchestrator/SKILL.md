---
name: product-orchestrator
description: Orquestra automaticamente todas as skills de produto e engenharia, do planejamento ao deploy e documentação.
---

# Product Orchestrator

## Trigger

- criar produto
- criar saas
- criar sistema completo
- criar aplicacao
- criar plataforma

## Inputs

### Required

- `objetivo_principal`

### Optional

- `tipo_de_usuario`
- `escala`
- `restricoes`
- `prazo`

## Orchestration Strategy

**Mode**: stateful
**Strategy**: conditional_pipeline

### Skills Pipeline

1. **system-architecture-designer**
   - On Success: `product-designer`
   - On Fail: `abort`
2. **product-designer**
   - On Success: `ux-heuristics-auditor`
   - On Fail: `system-architecture-designer`
3. **ux-heuristics-auditor**
   - On Success: `frontend-ux-ui-master`
   - On Fail: `product-designer`
4. **frontend-ux-ui-master**
   - On Success: `backend-api-master`
   - On Fail: `ux-heuristics-auditor`
5. **backend-api-master**
   - On Success: `database-designer`
   - On Fail: `system-architecture-designer`
6. **database-designer**
   - On Success: `security-audit-agent`
   - On Fail: `backend-api-master`
7. **security-audit-agent**
   - On Success: `test-engineer`
   - On Fail: `backend-api-master`
8. **test-engineer**
   - On Success: `devops-automation-engineer`
   - On Fail: `backend-api-master`
9. **devops-automation-engineer**
   - On Success: `technical-writer`
   - On Fail: `security-audit-agent`

## Validation Rules

- Arquitetura deve ser consistente com o produto
- UX não pode ter fricções críticas
- Frontend deve seguir design system
- Backend deve ter regras claras
- Banco deve suportar crescimento
- Falhas críticas de segurança bloqueiam avanço
- Testes devem cobrir fluxos principais
- Deploy deve ser reproduzível

## Output Deliverables

- Arquitetura definida
- MVP estruturado
- UX validado
- Frontend profissional
- Backend funcional
- Banco modelado
- Segurança auditada
- Testes definidos
- Pipeline de deploy
- Documentação completa
