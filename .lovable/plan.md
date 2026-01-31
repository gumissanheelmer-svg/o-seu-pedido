
# Plano: Agenda Smart - Encomendas

## Visao Geral

Este plano implementa um sistema completo de gestao de encomendas com tema escuro elegante, integracao com pagamentos moveis (M-Pesa/e-Mola), e fluxo simplificado para clientes sem necessidade de login.

---

## Alteracoes no Banco de Dados

### 1. Novos Campos na Tabela `businesses`

Adicionar campos para configuracao de pagamentos:

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `mpesa_number` | text | Numero M-Pesa do negocio |
| `emola_number` | text | Numero e-Mola do negocio |
| `payment_required` | boolean | Se pagamento e obrigatorio |
| `signal_amount` | numeric | Valor do sinal (opcional) |
| `confirmation_message` | text | Mensagem padrao de confirmacao |

### 2. Novos Campos na Tabela `orders`

Adicionar campos para rastreamento de pagamento:

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `payment_method` | text | M-Pesa, e-Mola ou null |
| `transaction_code` | text | Codigo unico da transacao |
| `amount_paid` | numeric | Valor pago pelo cliente |
| `payment_confirmed` | boolean | Se pagamento foi confirmado |
| `order_description` | text | Descricao personalizada da encomenda |
| `quantity` | integer | Quantidade de itens |
| `order_type` | text | Tipo de encomenda |

### 3. Nova Tabela `used_transaction_codes`

Para garantir que cada codigo de transacao seja usado apenas uma vez:

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `id` | uuid | Identificador unico |
| `business_id` | uuid | Referencia ao negocio |
| `transaction_code` | text | Codigo da transacao |
| `order_id` | uuid | Referencia ao pedido |
| `created_at` | timestamp | Data de criacao |

### 4. Atualizar Enum `business_type`

Adicionar novos tipos: `presente`, `decoracao`, `personalizado`

---

## Novas Paginas e Componentes

### Pagina Publica de Encomenda `/p/{slug}`

Fluxo em 4 etapas com stepper visual:

```text
+----------------+     +----------------+     +----------------+     +----------------+
|   1. Produto   | --> |  2. Entrega    | --> |  3. Pagamento  | --> |  4. Confirmar  |
|   - Tipo       |     |  - Data/Hora   |     |  - M-Pesa      |     |  - Resumo      |
|   - Descricao  |     |  - Endereco    |     |  - e-Mola      |     |  - WhatsApp    |
|   - Quantidade |     |  - Obs         |     |  - Codigo      |     |                |
+----------------+     +----------------+     +----------------+     +----------------+
```

#### Componentes a Criar:

1. **`OrderStepper`** - Indicador visual das etapas
2. **`ProductStep`** - Formulario do produto/encomenda
3. **`DeliveryStep`** - Dados de entrega e cliente
4. **`PaymentStep`** - Instrucoes e validacao de pagamento
5. **`ConfirmationStep`** - Resumo e botao WhatsApp
6. **`PublicOrderPage`** - Pagina principal que orquestra o fluxo

### Painel Admin `/admin`

Dashboard para gestao do negocio:

1. **`AdminLayout`** - Layout com sidebar escura
2. **`AdminDashboard`** - Visao geral com metricas
3. **`OrdersList`** - Lista de encomendas
4. **`OrderDetail`** - Detalhes de uma encomenda
5. **`ProductsManager`** - CRUD de produtos
6. **`BusinessSettings`** - Configuracoes do negocio
7. **`PaymentSettings`** - Configuracoes de pagamento

---

## Estrutura de Arquivos

```text
src/
├── pages/
│   ├── admin/
│   │   ├── AdminDashboard.tsx
│   │   ├── Orders.tsx
│   │   ├── Products.tsx
│   │   └── Settings.tsx
│   └── public/
│       └── PublicOrderPage.tsx
├── components/
│   ├── admin/
│   │   ├── AdminLayout.tsx
│   │   ├── AdminSidebar.tsx
│   │   ├── DashboardStats.tsx
│   │   ├── OrderCard.tsx
│   │   ├── OrderDetail.tsx
│   │   └── PaymentSettingsForm.tsx
│   └── order/
│       ├── OrderStepper.tsx
│       ├── ProductStep.tsx
│       ├── DeliveryStep.tsx
│       ├── PaymentStep.tsx
│       └── ConfirmationStep.tsx
├── hooks/
│   ├── useBusiness.ts
│   ├── useOrders.ts
│   └── useTransactionValidation.ts
└── lib/
    ├── payment-parser.ts
    └── whatsapp.ts (atualizar)
```

---

## Funcionalidades Principais

### 1. Extracao Automatica de Dados de Pagamento

O sistema ira analisar a mensagem de confirmacao colada pelo cliente e extrair:
- Codigo da transacao
- Valor pago
- Metodo de pagamento (M-Pesa ou e-Mola)

Exemplo de regex para M-Pesa:
```text
Transacao: ([A-Z0-9]+)
Valor: ([0-9.,]+) MZN
```

### 2. Validacao de Codigo Unico

- Verificar na tabela `used_transaction_codes` antes de aceitar
- Bloquear codigos ja utilizados
- Exibir erro claro ao usuario

### 3. Geracao de Mensagem WhatsApp

Mensagem dinamica que inclui ou exclui dados de pagamento conforme configuracao:

```text
Ola! 

Fiz uma encomenda na {{NOME_DO_NEGOCIO}}

Cliente: {{NOME_DO_CLIENTE}}
Encomenda: {{DESCRICAO}}
Data de entrega: {{DATA}}
Hora: {{HORA}}
Local: {{LOCAL}}

[SE HOUVER PAGAMENTO]
Metodo: {{METODO_PAGAMENTO}}
Codigo da transacao: {{CODIGO_TRANSACAO}}
Valor pago: {{VALOR_PAGO}} MZN

Aguardo confirmacao
```

---

## Design System - Tema Escuro

### Atualizacoes no CSS

O sistema ja possui variaveis dark mode. O tema escuro sera ativado por padrao na pagina publica com estas caracteristicas:

- **Fundo**: Tons de cinza escuro elegante
- **Cards**: Fundos sutilmente mais claros
- **Botoes**: Coral/laranja vibrante para CTAs
- **Sucesso**: Verde oliva para confirmacoes
- **Tipografia**: Branca com hierarquia clara

### Componentes Mobile-First

- Botoes grandes (min 48px altura)
- Espacamento generoso
- Inputs com labels claras
- Animacoes suaves com Framer Motion
- Feedback visual para todas acoes

---

## Rotas a Adicionar

| Rota | Componente | Descricao |
|------|------------|-----------|
| `/p/:slug` | PublicOrderPage | Pagina publica de encomenda |
| `/admin` | AdminDashboard | Dashboard do admin |
| `/admin/encomendas` | Orders | Lista de encomendas |
| `/admin/produtos` | Products | Gestao de produtos |
| `/admin/configuracoes` | Settings | Configuracoes do negocio |

---

## Seguranca e RLS

### Politicas Existentes (manter)
- `orders` INSERT publico para negocios aprovados
- `orders` SELECT/UPDATE apenas para admin do negocio

### Novas Politicas
- `used_transaction_codes` INSERT publico com validacao
- `used_transaction_codes` SELECT para admin verificar historico

---

## Sequencia de Implementacao

1. **Fase 1: Banco de Dados**
   - Migracoes para novos campos e tabelas
   - Politicas RLS para tabela de codigos

2. **Fase 2: Pagina Publica**
   - Componentes do fluxo de encomenda
   - Logica de validacao de pagamento
   - Integracao WhatsApp

3. **Fase 3: Painel Admin**
   - Layout com sidebar
   - Dashboard com metricas
   - Lista e detalhes de encomendas
   - Configuracoes de pagamento

4. **Fase 4: Polish**
   - Tema escuro refinado
   - Animacoes
   - Responsividade mobile
   - Testes e validacoes

---

## Detalhes Tecnicos

### Parser de Mensagem de Pagamento

```typescript
// src/lib/payment-parser.ts
interface PaymentInfo {
  transactionCode: string;
  amount: number;
  method: 'mpesa' | 'emola';
}

function parsePaymentMessage(message: string): PaymentInfo | null {
  // Regex patterns para M-Pesa e e-Mola
  // Extrair codigo, valor e metodo
}
```

### Hook de Validacao de Transacao

```typescript
// src/hooks/useTransactionValidation.ts
function useTransactionValidation() {
  const validateCode = async (code: string, businessId: string) => {
    // Verificar se codigo ja foi usado
    // Retornar se e valido ou nao
  };
  
  const registerCode = async (code: string, businessId: string, orderId: string) => {
    // Registrar codigo como usado
  };
}
```

### Atualizacao do WhatsApp Helper

```typescript
// src/lib/whatsapp.ts (atualizar)
interface OrderMessageParams {
  businessName: string;
  clientName: string;
  description: string;
  deliveryDate: string;
  deliveryTime?: string;
  deliveryAddress?: string;
  paymentMethod?: string;
  transactionCode?: string;
  amountPaid?: number;
}

function generateOrderMessage(params: OrderMessageParams): string {
  // Gerar mensagem formatada
  // Incluir dados de pagamento apenas se existirem
}
```
