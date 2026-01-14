# Roadmap - Sistema Financeiro (Trilha do Corte)

## Status: Implementado ✅

### Fase 1 - Fechamento Básico na Agenda

- [x] CalendarHeader exibe Previsto vs Realizado
- [x] Cálculo baseado em status 'completed'

### Fase 2 - Página de Financeiro

- [x] Rota `/dashboard/financial`
- [x] FinanceiroPage.tsx com visão diária/mensal
- [x] Cards: Total do Dia, Meta Diária, Ticket Médio
- [x] Calendário mensal com faturamento por dia

### Fase 3 - Integração Header

- [x] Ícone da carteira navega para /dashboard/financial

---

## Backlog - Futuras Implementações 🔜

### Configurações do Caixa (Botão Engrenagem)

1. **Definir Meta Diária** - Alterar o valor padrão de R$ 500
2. **Formas de Pagamento** - Habilitar/desabilitar Pix, Cartão, Dinheiro
3. **Exportar Relatórios** - Gerar PDF do faturamento diário/mensal
4. **Alerta de Meta** - Notificação quando atingir X% da meta

### Histórico e Fechamentos

- [ ] Botão "Fechar Caixa do Dia" com confirmação
- [ ] Persistência de fechamentos no banco de dados
- [ ] Histórico de fechamentos anteriores (aba HISTÓRICO)
- [ ] Comparativo dia anterior / semana anterior

### Formas de Pagamento

- [ ] Registrar método por atendimento (Pix, Dinheiro, Cartão Débito, Cartão Crédito)
- [ ] Relatório de distribuição por forma de pagamento
- [ ] Ícones visuais para cada método

### Relatórios Avançados

- [ ] Gráfico de linha com faturamento dos últimos 30 dias
- [ ] Comparativo mês atual vs mês anterior
- [ ] Top 5 serviços mais vendidos
- [ ] Horários de pico (heatmap)

---

## Notas Técnicas

### Arquivos Relacionados

- `src/components/dashboard/FinanceiroPage.tsx` - Página principal
- `src/components/dashboard/calendar/CalendarHeader.tsx` - Header da agenda com Previsto/Realizado
- `src/layouts/DashboardLayout.tsx` - Navegação do ícone Wallet
- `src/routes.tsx` - Rota /dashboard/financial

### Dependências

- framer-motion (animações)
- lucide-react (ícones)
