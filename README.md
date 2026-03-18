# Purchase Approval System

Sistema fullstack de **Termo de Requisicao de Compra** com fluxo de aprovacao multinivel baseado em roles e regras de negocio condicionais.

> Coordenador de Departamento → Gerente Geral (condicional) → Coordenador Financeiro

---

## Sumario

- [Sobre o Projeto](#sobre-o-projeto)
- [Regras de Negocio](#regras-de-negocio)
- [Fluxo de Aprovacao](#fluxo-de-aprovacao)
- [Modelagem de Dados](#modelagem-de-dados)
- [Arquitetura](#arquitetura)
- [Stack Tecnologica](#stack-tecnologica)
- [Endpoints da API](#endpoints-da-api)
- [Controle de Acesso (RBAC)](#controle-de-acesso-rbac)
- [Como Executar](#como-executar)
- [Variaveis de Ambiente](#variaveis-de-ambiente)
- [Scripts SQL](#scripts-sql)
- [Screenshots](#screenshots)

---

## Sobre o Projeto

Sistema desenvolvido para gerenciar o processo de requisicao de compras dentro de uma organizacao. Um colaborador solicita a compra de um produto e essa solicitacao passa por um **pipeline de aprovacao em ate 3 etapas**, dependendo do valor total.

O sistema implementa:

- **Autenticacao JWT** com expiracao de 4 horas
- **Controle de acesso baseado em roles (RBAC)** com 4 perfis distintos
- **Fluxo condicional** que pula a etapa do Gerente Geral para valores ate R$500
- **Isolamento por departamento** onde o Coordenador so aprova solicitacoes do seu proprio setor

---

## Regras de Negocio

### RN01 — Criacao da Solicitacao
- Apenas usuarios autenticados com role `USER` ou `COORDINATOR` podem criar solicitacoes
- O valor total e calculado automaticamente: `quantidade x preco_unitario`
- O valor total deve ser maior que zero
- Todos os campos sao obrigatorios (produto, descricao, quantidade, preco unitario, metodo de pagamento)
- A solicitacao e vinculada ao departamento do usuario solicitante

### RN02 — Aprovacao do Coordenador
- O Coordenador **so visualiza e aprova solicitacoes do seu proprio departamento**
- Se o valor total for **<= R$500**, a etapa do Gerente Geral e automaticamente marcada como `SKIPPED`
- Se o valor total for **> R$500**, a solicitacao segue para o Gerente Geral

### RN03 — Aprovacao do Gerente Geral
- O Gerente Geral **so recebe solicitacoes com valor > R$500**
- So pode aprovar se o Coordenador ja tiver aprovado (`coordinator_status = APPROVED`)
- Solicitacoes com valor <= R$500 nunca aparecem para o Gerente Geral

### RN04 — Aprovacao do Coordenador Financeiro
- E a **ultima etapa** do fluxo — aprovacao final
- So pode aprovar se:
  - `coordinator_status = APPROVED` **E**
  - `general_manager_status IN (APPROVED, SKIPPED)`
- Apos aprovacao financeira, a solicitacao esta **totalmente aprovada**

### RN05 — Rejeicao
- Qualquer aprovador pode **rejeitar** na sua etapa
- A rejeicao interrompe o fluxo — nao avanca para a proxima etapa
- O status rejeitado e definitivo na etapa em que ocorreu

### RN06 — Metodos de Pagamento
- Opcoes disponiveis: `PIX`, `CREDIT_CARD`, `DEBIT_CARD`, `BOLETO`, `TRANSFER`

---

## Fluxo de Aprovacao

### Solicitacao com valor <= R$500 (2 etapas)

```
Usuario cria solicitacao (R$300)
        |
        v
[Coordenador do Departamento] ── APROVA
        |
        v
  Gerente Geral: SKIPPED (automatico)
        |
        v
[Coordenador Financeiro] ── APROVA
        |
        v
   SOLICITACAO APROVADA
```

### Solicitacao com valor > R$500 (3 etapas)

```
Usuario cria solicitacao (R$800)
        |
        v
[Coordenador do Departamento] ── APROVA
        |
        v
[Gerente Geral] ── APROVA
        |
        v
[Coordenador Financeiro] ── APROVA
        |
        v
   SOLICITACAO APROVADA
```

### Fluxo de Rejeicao (qualquer etapa)

```
Usuario cria solicitacao
        |
        v
[Coordenador do Departamento] ── REJEITA
        |
        v
   SOLICITACAO REJEITADA (fluxo encerrado)
```

---

## Modelagem de Dados

### Diagrama Entidade-Relacionamento

```
┌─────────────────────┐       ┌──────────────────────────┐
│     departments      │       │          users            │
├─────────────────────┤       ├──────────────────────────┤
│ id          PK INT  │◄──┐   │ id            PK INT     │
│ name        VARCHAR │   │   │ name          VARCHAR    │
│ created_at  DATE    │   ├───│ department_id FK INT     │
│ updated_at  DATE    │   │   │ email         VARCHAR    │
└─────────────────────┘   │   │ password      VARCHAR    │
                          │   │ role          ENUM       │
                          │   │ created_at    DATE       │
                          │   │ updated_at    DATE       │
                          │   └───────────┬──────────────┘
                          │               │
                          │               │ 1:N
                          │               ▼
                          │   ┌──────────────────────────────┐
                          │   │     purchase_requests          │
                          │   ├──────────────────────────────┤
                          │   │ id                    PK INT │
                          └───│ department_id         FK INT │
                              │ user_id               FK INT │
                              │ product_name        VARCHAR  │
                              │ description           TEXT   │
                              │ amount         DECIMAL(10,2) │
                              │ payment_method        ENUM   │
                              │ coordinator_status    ENUM   │
                              │ general_manager_status ENUM  │
                              │ finance_status        ENUM   │
                              │ created_at            DATE   │
                              │ updated_at            DATE   │
                              └──────────────────────────────┘
```

### Relacionamentos

| Origem | Destino | Tipo | FK |
|--------|---------|------|----|
| `users` | `departments` | N:1 | `users.department_id` → `departments.id` |
| `purchase_requests` | `users` | N:1 | `purchase_requests.user_id` → `users.id` |
| `purchase_requests` | `departments` | N:1 | `purchase_requests.department_id` → `departments.id` |

### Enums

**User Roles:**

| Role | Descricao |
|------|-----------|
| `USER` | Colaborador que cria solicitacoes |
| `COORDINATOR` | Coordenador de departamento — 1a aprovacao |
| `GENERAL_MANAGER` | Gerente Geral — 2a aprovacao (valores > R$500) |
| `COORDINATION_FINANCE` | Coordenador Financeiro — aprovacao final |

**Approval Status:**

| Status | Descricao |
|--------|-----------|
| `PENDING` | Aguardando avaliacao |
| `APPROVED` | Aprovado pelo responsavel da etapa |
| `REJECTED` | Rejeitado pelo responsavel da etapa |
| `SKIPPED` | Etapa pulada automaticamente (regra de valor) |

**Payment Methods:**

| Metodo | Descricao |
|--------|-----------|
| `PIX` | Pagamento instantaneo |
| `CREDIT_CARD` | Cartao de credito |
| `DEBIT_CARD` | Cartao de debito |
| `BOLETO` | Boleto bancario |
| `TRANSFER` | Transferencia bancaria |

---

## Arquitetura

### Backend — Layered Architecture (Controller → Service → Repository)

```
Request HTTP
    │
    ▼
┌─────────┐     ┌──────────┐     ┌──────────┐     ┌──────────────┐
│  Router  │────▶│Controller│────▶│ Service  │────▶│  Repository  │
│         │     │          │     │(regras)  │     │ (Sequelize)  │
└─────────┘     └──────────┘     └──────────┘     └──────┬───────┘
    │                                                      │
    │  Middlewares                                          ▼
    ├── authMiddleware (JWT)                           ┌─────────┐
    └── roleMiddleware (RBAC)                          │  MySQL  │
                                                       └─────────┘
```

### Estrutura de Pastas

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Conexao Sequelize + MySQL
│   ├── controller/
│   │   ├── authController.js    # Login
│   │   ├── departmentController.js
│   │   ├── purchaseRequestsController.js
│   │   └── userController.js
│   ├── middlewares/
│   │   ├── authMiddleware.js    # Verificacao JWT
│   │   └── roleMiddleware.js    # Autorizacao por role
│   ├── model/
│   │   ├── Department.js
│   │   ├── PurchaseRequest.js
│   │   ├── User.js
│   │   └── index.js             # Registro dos models + associations
│   ├── repository/
│   │   ├── departmentRepository.js
│   │   ├── purchaseRequestsRepository.js
│   │   └── userRepository.js
│   ├── router/
│   │   ├── authRouter.js
│   │   ├── departmentRouter.js
│   │   ├── purchaseRequestsRouter.js
│   │   ├── userRouter.js
│   │   └── index.js             # Agregador de rotas
│   ├── service/
│   │   ├── authService.js
│   │   ├── departmentService.js
│   │   ├── purchaseRequestsService.js
│   │   └── userService.js
│   ├── utils/
│   │   └── generateToken.js     # Geracao JWT
│   ├── app.js                   # Express setup + middlewares
│   └── index.js                 # Entry point + sync DB
└── .env

frontend/
├── src/
│   ├── components/
│   │   ├── ApprovalTable.jsx    # Tabela de aprovacoes pendentes
│   │   ├── PurchaseForm.jsx     # Formulario de nova solicitacao
│   │   ├── PurchaseTable.jsx    # Lista de solicitacoes do usuario
│   │   └── StatusChip.jsx       # Badge de status reutilizavel
│   ├── pages/
│   │   ├── Dashboard.jsx        # Tela principal com tabs por role
│   │   ├── DepartmentManagement.jsx
│   │   ├── Login.jsx
│   │   └── UserManagement.jsx
│   ├── service/
│   │   └── apiBackend.js        # Axios instance + interceptor JWT
│   ├── App.jsx                  # Roteamento principal
│   └── main.jsx                 # Entry point React
└── index.html
```

---

## Stack Tecnologica

### Backend

| Tecnologia | Versao | Funcao |
|-----------|--------|--------|
| Node.js | 18+ | Runtime |
| Express | 5.2.1 | Framework HTTP |
| Sequelize | 6.37.7 | ORM |
| MySQL | 8.0+ | Banco de dados relacional |
| JWT | 9.0.3 | Autenticacao stateless |
| bcrypt | 6.0.0 | Hash de senhas |
| dotenv | 17.3.1 | Variaveis de ambiente |
| CORS | 2.8.6 | Cross-Origin Resource Sharing |
| Nodemon | 3.1.11 | Hot reload (dev) |

### Frontend

| Tecnologia | Versao | Funcao |
|-----------|--------|--------|
| React | 19.2.0 | Biblioteca UI |
| Material UI | 7.3.8 | Design System / Componentes |
| Emotion | 11.14.0 | CSS-in-JS |
| Axios | 1.13.5 | Cliente HTTP |
| Vite | 7.3.1 | Build tool + dev server |
| ESLint | 9.39.1 | Linting |

---

## Endpoints da API

**Base URL:** `http://localhost:8080/api`

### Autenticacao

| Metodo | Rota | Descricao | Auth |
|--------|------|-----------|------|
| `POST` | `/api/login` | Autenticar usuario | Nao |

**Request Body:**
```json
{
  "email": "usuario@empresa.com",
  "password": "senha123"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Joao Silva",
    "email": "joao@empresa.com",
    "role": "USER",
    "department_id": 1
  }
}
```

### Solicitacoes de Compra

| Metodo | Rota | Descricao | Auth | Roles |
|--------|------|-----------|------|-------|
| `POST` | `/api/purchase-requests` | Criar solicitacao | Sim | Todos |
| `GET` | `/api/purchase-requests` | Listar minhas solicitacoes | Sim | Todos |
| `GET` | `/api/purchase-requests/pending` | Listar aprovacoes pendentes | Sim | COORDINATOR, GENERAL_MANAGER, COORDINATION_FINANCE |
| `PATCH` | `/api/purchase-requests/:id/approve` | Aprovar solicitacao | Sim | COORDINATOR, GENERAL_MANAGER, COORDINATION_FINANCE |
| `PATCH` | `/api/purchase-requests/:id/reject` | Rejeitar solicitacao | Sim | COORDINATOR, GENERAL_MANAGER, COORDINATION_FINANCE |

**Request Body — Criar solicitacao:**
```json
{
  "product_name": "Monitor Ultrawide 34",
  "description": "Monitores para equipe de design",
  "quantity": 2,
  "unit_price": 400,
  "payment_method": "CREDIT_CARD"
}
```

### Usuarios

| Metodo | Rota | Descricao | Auth | Roles |
|--------|------|-----------|------|-------|
| `GET` | `/api/users` | Listar todos os usuarios | Sim | Todos |
| `POST` | `/api/users` | Criar novo usuario | Sim | GENERAL_MANAGER |

### Departamentos

| Metodo | Rota | Descricao | Auth | Roles |
|--------|------|-----------|------|-------|
| `GET` | `/api/departments` | Listar departamentos | Sim | Todos |
| `POST` | `/api/departments` | Criar departamento | Sim | GENERAL_MANAGER |

---

## Controle de Acesso (RBAC)

### Matriz de Permissoes

| Funcionalidade | USER | COORDINATOR | GENERAL_MANAGER | COORDINATION_FINANCE |
|---------------|------|-------------|-----------------|---------------------|
| Criar solicitacao | ✅ | ✅ | ❌ | ❌ |
| Ver minhas solicitacoes | ✅ | ✅ | ❌ | ❌ |
| Aprovar/Rejeitar (1a etapa) | ❌ | ✅ | ❌ | ❌ |
| Aprovar/Rejeitar (2a etapa) | ❌ | ❌ | ✅ | ❌ |
| Aprovar/Rejeitar (3a etapa) | ❌ | ❌ | ❌ | ✅ |
| Gerenciar usuarios | ❌ | ❌ | ✅ | ❌ |
| Gerenciar departamentos | ❌ | ❌ | ✅ | ❌ |

### Implementacao de Seguranca

| Camada | Mecanismo | Descricao |
|--------|-----------|-----------|
| Autenticacao | JWT (Bearer Token) | Token com expiracao de 4 horas |
| Senha | bcrypt (salt rounds: 10) | Hash unidirecional |
| Autorizacao | Middleware RBAC | Verifica role antes de executar a acao |
| Departamental | Filtro no Service | Coordenador so ve dados do seu departamento |
| Headers | CORS habilitado | Controle de origem das requisicoes |

---

## Como Executar

### Pre-requisitos

- Node.js 18+
- MySQL 8.0+
- npm ou yarn

### 1. Clonar o repositorio

```bash
git clone https://github.com/samuelguedesss/purchase-approval-system.git
cd purchase-approval-system
```

### 2. Configurar o banco de dados

```sql
CREATE DATABASE IF NOT EXISTS sistema_aprovacao
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

### 3. Backend

```bash
cd backend
npm install
```

Criar o arquivo `.env` na raiz do backend:

```env
PORT=8080
BASE_URL=http://localhost/
DB_HOST=localhost
DB_NAME=sistema_aprovacao
DB_USER=root
DB_PASS=sua_senha
JWT_SECRET=sua_chave_secreta_aqui
```

Iniciar o servidor:

```bash
npm run dev
```

> O Sequelize cria as tabelas automaticamente via `sync()` na inicializacao.

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

> Acesse: **http://localhost:5173**

### 5. Seed — Dados de Teste

Execute no MySQL apos o backend criar as tabelas:

```sql
-- Departamentos
INSERT INTO departments (name) VALUES ('Tecnologia da Informacao');
INSERT INTO departments (name) VALUES ('Marketing');
INSERT INTO departments (name) VALUES ('Recursos Humanos');

-- Admin / Gerente Geral — senha: senha123
INSERT INTO users (name, email, password, role, department_id) VALUES
('Admin', 'admin@admin.com',
'$2b$10$v4gVV16yvc007ogZ1S9VruyJ5MckmQgqFBLmkDhZUCp5BVJCCw3Za',
'GENERAL_MANAGER', NULL);

-- Usuario comum (TI) — senha: senha123
INSERT INTO users (name, email, password, role, department_id) VALUES
('Joao Silva', 'joao@empresa.com',
'$2b$10$v4gVV16yvc007ogZ1S9VruyJ5MckmQgqFBLmkDhZUCp5BVJCCw3Za',
'USER', 1);

-- Coordenador do departamento TI — senha: senha123
INSERT INTO users (name, email, password, role, department_id) VALUES
('Maria Souza', 'maria@empresa.com',
'$2b$10$v4gVV16yvc007ogZ1S9VruyJ5MckmQgqFBLmkDhZUCp5BVJCCw3Za',
'COORDINATOR', 1);

-- Coordenador Financeiro — senha: senha123
INSERT INTO users (name, email, password, role, department_id) VALUES
('Carlos Lima', 'carlos@empresa.com',
'$2b$10$v4gVV16yvc007ogZ1S9VruyJ5MckmQgqFBLmkDhZUCp5BVJCCw3Za',
'COORDINATION_FINANCE', NULL);
```

### Usuarios de Teste

| Perfil | Email | Senha |
|--------|-------|-------|
| Gerente Geral | `admin@admin.com` | `senha123` |
| Usuario (TI) | `joao@empresa.com` | `senha123` |
| Coordenador (TI) | `maria@empresa.com` | `senha123` |
| Financeiro | `carlos@empresa.com` | `senha123` |

---

## Variaveis de Ambiente

| Variavel | Descricao | Exemplo |
|----------|-----------|---------|
| `PORT` | Porta do servidor backend | `8080` |
| `BASE_URL` | URL base da aplicacao | `http://localhost/` |
| `DB_HOST` | Host do MySQL | `localhost` |
| `DB_NAME` | Nome do banco de dados | `sistema_aprovacao` |
| `DB_USER` | Usuario do MySQL | `root` |
| `DB_PASS` | Senha do MySQL | `root` |
| `JWT_SECRET` | Chave secreta para assinar tokens JWT | `sua_chave_secreta` |

---

## Scripts SQL

### Criar o banco

```sql
CREATE DATABASE IF NOT EXISTS sistema_aprovacao
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

### Estrutura das tabelas (referencia)

> As tabelas sao criadas automaticamente pelo Sequelize. Abaixo a estrutura SQL equivalente:

```sql
CREATE TABLE departments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('USER','COORDINATOR','GENERAL_MANAGER','COORDINATION_FINANCE') NOT NULL,
  department_id INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE purchase_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  department_id INT NOT NULL,
  product_name VARCHAR(200) NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('PIX','CREDIT_CARD','DEBIT_CARD','BOLETO','TRANSFER') NOT NULL,
  coordinator_status ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  general_manager_status ENUM('PENDING','APPROVED','REJECTED','SKIPPED') DEFAULT 'PENDING',
  finance_status ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (department_id) REFERENCES departments(id)
);
```

---

## Screenshots

> Adicione screenshots das telas do sistema aqui

### Tela de Login
`<!-- ![Login](./screenshots/login.png) -->`

### Dashboard — Usuario
`<!-- ![Dashboard User](./screenshots/dashboard-user.png) -->`

### Formulario de Nova Solicitacao
`<!-- ![Purchase Form](./screenshots/purchase-form.png) -->`

### Painel de Aprovacoes Pendentes
`<!-- ![Approvals](./screenshots/approvals.png) -->`

### Detalhes da Solicitacao — Fluxo Completo
`<!-- ![Detail](./screenshots/detail-modal.png) -->`

---

## Autor

**Samuel Guedes** — [GitHub](https://github.com/samuelguedesss)

---

## Licenca

Este projeto esta sob a licenca MIT.
