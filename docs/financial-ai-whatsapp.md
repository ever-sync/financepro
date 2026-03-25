# 🤖 Assistente Financeiro com IA e WhatsApp

## Visão Geral

Este módulo adiciona inteligência artificial ao sistema financeiro para:
- **Analisar automaticamente** seus gastos e receitas
- **Gerar alertas** sobre situações financeiras críticas
- **Fornecer recomendações** personalizadas de economia
- **Enviar relatórios** diretamente no seu WhatsApp

## Funcionalidades

### 1. Análise Financeira Automática

A IA analisa todos os seus dados financeiros do mês:
- Receitas
- Compras de fornecedores
- Custos fixos e variáveis (empresa e pessoal)
- Dívidas

E gera:
- **Resumo** da situação financeira
- **Alertas** classificados por criticidade (crítico, aviso, informação)
- **Recomendações** práticas com potencial de economia

### 2. Integração com WhatsApp

Envie análises completas diretamente para seu celular via WhatsApp:
- Formato otimizado para leitura móvel
- Emojis para melhor visualização
- Resumo executivo + alertas + principais recomendações

## Configuração

### Variáveis de Ambiente

Adicione ao seu `.env`:

```bash
# Configuração da API de WhatsApp (use sua provedora preferida)
WHATSAPP_API_URL=https://api.sua-provedora.com
WHATSAPP_API_KEY=sua-chave-de-api

# Certifique-se que a chave da LLM está configurada
FORGE_API_KEY=sua-chave-openai-ou-compativel
```

### Provedores de WhatsApp Suportados

O sistema é compatível com qualquer API REST de WhatsApp. Exemplos populares:

1. **Twilio WhatsApp API**
2. **Evolution API** (open source)
3. **Z-API**
4. **WPPConnect**
5. **Baileys**

Para usar, adapte a função `sendWhatsAppMessage` em `/server/db/repositories/financial-analysis.ts`.

## Como Usar

### Via API (tRPC)

#### 1. Obter Análise Financeira

```typescript
const analysis = await trpc.financialAnalysis.analyze.query({
  month: 3, // Março (opcional, usa mês atual se omitido)
  year: 2025 // Ano (opcional, usa ano atual se omitido)
});

// Retorna:
{
  summary: "String com resumo geral",
  alerts: [
    {
      type: "critical" | "warning" | "info",
      title: "Título do alerta",
      message: "Descrição detalhada",
      impact: 1500.00 // Valor em reais (opcional)
    }
  ],
  recommendations: [
    {
      category: "categoria",
      title: "Título da recomendação",
      description: "Descrição detalhada",
      potentialSavings: 500.00, // Economia potencial (opcional)
      priority: "high" | "medium" | "low"
    }
  ],
  totalExpenses: 15000.00,
  totalRevenue: 18000.00,
  balance: 3000.00,
  expenseByCategory: [...]
}
```

#### 2. Enviar Análise para WhatsApp

```typescript
const sent = await trpc.financialAnalysis.sendWhatsApp.mutation({
  phoneNumber: "+5511999999999", // Número com código do país
  month: 3,
  year: 2025
});

// Retorna: true se enviado com sucesso, false caso contrário
```

### Exemplo de Mensagem no WhatsApp

```
🔍 *ANÁLISE FINANCEIRA*

*Resumo:* Suas despesas estão 15% acima da média dos últimos 3 meses. 
Atenção especial necessária com custos variáveis.

💰 *RESUMO DO MÊS*
Receitas: R$ 18.000,00
Despesas: R$ 15.000,00
*Saldo: R$ 3.000,00*

⚠️ *ALERTAS*
🔴 *Saldo Abaixo do Esperado*
Seu saldo está 40% menor que a média dos últimos 3 meses.
Impacto: R$ 2.000,00

🟡 *Custos Variáveis Elevados*
Custos variáveis representam 35% das despesas, acima do ideal de 25%.

💡 *RECOMENDAÇÕES*
🔥 *Renegociar Fornecedores*
Identificamos 3 fornecedores com aumentos recentes. Considere cotações alternativas.
Economia potencial: R$ 800,00

⚡ *Reduzir Assinaturas*
Você tem 5 assinaturas recorrentes pouco utilizadas.
Economia potencial: R$ 250,00

_Acesse o sistema para ver detalhes completos._
```

## Estrutura de Arquivos

```
server/
├── db/
│   └── repositories/
│       └── financial-analysis.ts  # Lógica de análise e envio
├── routers.ts                      # Endpoints tRPC adicionados
└── _core/
    └── llm.ts                      # Integração com IA (já existente)
```

## Personalização

### Ajustar Prompt da IA

Edite o prompt no arquivo `financial-analysis.ts` para adaptar o tom e foco das análises:

```typescript
const messages: Message[] = [
  {
    role: "system",
    content: `SEU_PROMPT_PERSONALIZADO_AQUI`,
  },
];
```

### Adicionar Novas Categorias de Análise

Modifique a função `analyzeFinancialData` para incluir:
- Comparação com meses anteriores
- Projeções futuras
- Benchmarks do setor
- Metas financeiras pessoais

### Agendamento Automático

Para enviar análises automáticas (ex: todo dia 1º do mês):

```typescript
// Exemplo com node-cron
import cron from 'node-cron';
import { getDb } from './db';
import { analyzeFinancialData, sendFinancialAlertToWhatsApp } from './db/repositories/financial-analysis';

cron.schedule('0 9 1 * *', async () => {
  const db = await getDb();
  const users = await db.select().from(usersTable);
  
  for (const user of users) {
    const analysis = await analyzeFinancialData(user.id);
    await sendFinancialAlertToWhatsApp(user.id, user.phoneNumber, analysis);
  }
});
```

## Tratamento de Erros

O sistema inclui fallback automático:
- Se a IA falhar, retorna análise básica com saldo e alertas críticos
- Se o WhatsApp falhar, loga o erro e retorna `false`
- Sempre valida dados antes de processar

## Próximos Passos Sugeridos

1. **Configurar provedor de WhatsApp** escolhido
2. **Testar com dados reais** do sistema
3. **Ajustar prompts** conforme necessidade do negócio
4. **Implementar agendamento** para envios automáticos
5. **Adicionar histórico** de análises enviadas
6. **Criar dashboard** no frontend para visualizar análises

## Segurança

- ✅ Dados analisados são apenas do usuário autenticado
- ✅ Números de WhatsApp validados antes do envio
- ✅ Chaves de API protegidas via variáveis de ambiente
- ✅ Logs de erros sem exposição de dados sensíveis

---

**Autor:** Sistema Financeiro Empresarial  
**Versão:** 1.0.0  
**Última atualização:** Março 2025
