# 📘 Documentação Técnica - Trilha do Corte (SaaS Barber)

**Data:** 03 de Janeiro de 2026
**Versão:** 1.0
**Projeto:** Plataforma de Gestão para Barbearias com Estética Cyberpunk

---

## 1. Visão Geral do Sistema

O **Trilha do Corte** é uma plataforma SaaS "High-Tech" projetada para modernizar a gestão de barbearias. O sistema conecta clientes e barbeiros através de uma interface visualmente impactante (Cyberpunk/Dark Mode), priorizando a experiência do usuário (UX) e automação inteligente.

### Diferenciais Técnicos

- **Estética Imersiva:** Design System próprio focado em Neon/Dark Mode e Glassmorphism.
- **Inteligência Artificial:** Integração nativa com **Google Gemini** para comandos de voz e assistente de estilo.
- **PWA (Progressive Web App):** Aplicação otimizada para dispositivos móveis com performance nativa.

---

## 2. Stack Tecnológica

### Frontend (Client & Dashboard)

- **Framework:** React 19 + Vite (Build ultra-rápido).
- **Linguagem:** TypeScript (Tipagem estrita para segurança de código).
- **Estilização:** Tailwind CSS (Utility-first) + Animações CSS Keyframes.
- **Gráficos e Ícones:** Lucide React (Ícones de interface) + Phosphor Icons (Seles e badges).
- **Gerenciamento de Estado:** React Context API + LocalStorage (Persistência leve).

### Backend (API Server)

- **Runtime:** Node.js.
- **Framework Web:** Express.js (REST API).
- **Autenticação:** JWT (Json Web Token) + Bcrypt (Hashing de senhas).
- **Integração IA:** Google Generative AI SDK (`gemini-2.5-flash`).

### Banco de Dados & Armazenamento

- **Database:** PostgreSQL (Relacional - Clientes, Agendamentos, Serviços, Barbeiros).
- **Media Storage:** Cloudinary (Otimização e hospedagem de imagens de perfil/serviços).

---

## 3. Arquitetura e Fluxograma do Sistema

### Diagrama de Fluxo de Dados (Mermaid)

```mermaid
graph TD
    subgraph "Frontend Layer (PWA)"
        ClientApp[📱 App do Cliente]
        BarberDash[💻 Dashboard do Barbeiro]
    end

    subgraph "API Layer (Node.js/Express)"
        AuthAPI[🔐 Auth Service]
        ApptAPI[📅 Appointment Service]
        UserAPI[👥 User Service]
        AI_API[🤖 AI Controller]
    end

    subgraph "Data & External"
        DB[(🗄️ PostgreSQL)]
        Gemini[✨ Google Gemini AI]
        Cloudinary[☁️ Cloudinary Media]
    end

    %% Fluxos do Cliente
    ClientApp -->|Login/Register| AuthAPI
    ClientApp -->|Solicita Agendamento| ApptAPI
    ClientApp -->|Consulta Histórico/Perfil| UserAPI
    ClientApp -->|Upload Foto| Cloudinary

    %% Fluxos do Barbeiro
    BarberDash -->|Gerencia Agenda| ApptAPI
    BarberDash -->|Gestão Financeira| ApptAPI
    BarberDash -->|Configura Serviços| ApptAPI
    BarberDash -->|Comando de Voz/IA| AI_API

    %% Backend Integrations
    AuthAPI --> DB
    ApptAPI --> DB
    UserAPI --> DB
    AI_API -->|Prompts| Gemini
```

---

## 4. Detalhamento dos Módulos

### 📱 A. Módulo do Cliente (Customer App)

Focado na retenção e facilidade de agendamento.

1.  **Home & Agendamento:**
    - Visualização de serviços e combos ("Combos" têm destaque visual de selos).
    - Seleção de Barbeiro e Horário disponível.
    - Confirmação com resumo do serviço.
2.  **Perfil & Loyalty (Trilha Card):**
    - Cartão de fidelidade digital (Gamification).
    - Histórico de cortes com fotos ("Visual Memories").
    - Consulta IA: Sugestões de cortes baseados no formato de rosto (via Gemini).

### 💈 B. Módulo do Barbeiro (Dashboard Admin)

Ferramenta de gestão completa.

1.  **Dahsboard Home:**
    - Visão geral do dia (Fila de atendimento).
    - Indicadores financeiros rápidos.
    - Controle de "Aberto/Fechado".
2.  **Agenda (CalendarView):**
    - Visualização diária/semanal.
    - Bloqueio de horários.
    - Status de agendamento (Pendente, Confirmado, Concluído).
3.  **Gestão de Clientes:**
    - CRM simples: Lista de clientes, frequência e notas.
    - Invite Flow: Geração de links para cadastro rápido via WhatsApp.
4.  **Financeiro (Vault):**
    - Relatórios de faturamento.
    - Ticket médio e métricas de desempenho.
5.  **Configurações:**
    - Gestão de Serviços (Preço, Duração, Badges).
    - Horário de funcionamento do estabelecimento.

---

## 5. Fluxos Críticos de Negócio

### 1. Fluxo de Agendamento

1.  **Cliente:** Seleciona Serviço > Escolhe Barbeiro > Escolhe Data/Hora.
2.  **Frontend:** Valida disponibilidade localmente e envia `POST /appointments`.
3.  **Backend:** Verifica colisão de horário no DB > Cria registro `pending`.
4.  **Resultado:** Cliente vê confirmação; Agenda do Barbeiro atualiza em tempo real (polling/update).

### 2. Fluxo de Comando de Voz (IA)

1.  **Barbeiro:** Clica no microfone e fala "Bloquear agenda amanhã a tarde".
2.  **Frontend:** Captura áudio/texto > Envia para `/api/ai/command`.
3.  **Backend:** Envia prompt estruturado para o **Gemini**.
4.  **Gemini:** Interpreta intenção e retorna JSON de ação `{ action: "block_schedule", date: "tomorrow", period: "afternoon" }`.
5.  **Frontend:** Executa a ação na interface.

---

## 6. Estrutura de Banco de Dados (Principais Entidades)

- **Users (Clients/Barbers):** `id`, `name`, `email`, `phone`, `password`, `role`.
- **Services:** `id`, `name`, `price`, `duration`, `category`.
- **Appointments:** `id`, `client_id`, `barber_id`, `service_id`, `date`, `status`.

---

## 7. Próximos Passos (Roadmap Técnico)

- Refinamento da IA para "Conversational Booking".
- Implementação de WebSockets para atualizações da agenda em tempo real (substituindo polling).
- Expansão do sistema de Loyalty (Prêmios automatizados).
