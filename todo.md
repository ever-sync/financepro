# Sistema Financeiro Empresarial - TODO

## Infraestrutura
- [x] Schema do banco de dados (todas as tabelas)
- [x] Migrações SQL executadas
- [x] API backend (tRPC routers e db helpers)
- [x] Tema visual e design system (cores, fontes)
- [x] Layout Dashboard com sidebar navegação
- [x] Testes unitários (vitest)

## Páginas - Empresa (PJ)
- [x] Dashboard Empresa (faturamento, custos, lucro, caixa, gráficos)
- [x] Receitas (lançamento com deduções automáticas: 6% imposto)
- [x] Custos Fixos Empresa (aluguel, contador, software, etc.)
- [x] Custos Variáveis Empresa (gastos operacionais do dia a dia)
- [x] Funcionários (folha de pagamento, FGTS 8%, provisão 13º/férias)
- [x] Fornecedores (controle de compras, prazos, CNPJ)
- [x] Fundo de Reserva Empresa (meta: 3 meses de custos operacionais)

## Páginas - Pessoal (PF)
- [x] Dashboard Pessoal (pró-labore, dízimo, investimentos, saldo)
- [x] Contas Fixas Pessoais (aluguel casa, plano saúde, etc.)
- [x] Contas Variáveis Pessoais (mercado, lazer, etc.)
- [x] Dívidas Pessoais (plano de quitação, método avalanche)
- [x] Investimentos (10% do pró-labore, rendimentos, saldo acumulado)
- [x] Fundo de Reserva Pessoal (meta: 6 meses de despesas)

## Páginas - Geral
- [x] DRE Simplificado (demonstrativo de resultado)
- [x] Calendário de Pagamentos (visão mensal de vencimentos)
- [x] Configurações (percentuais, pró-labore, categorias)

## Funcionalidades Transversais
- [x] Separação PJ/PF (todo dinheiro entra na empresa primeiro)
- [x] Cálculo automático de imposto 6% sobre receitas
- [x] Cálculo automático de dízimo 10% sobre pró-labore líquido
- [x] Cálculo automático de investimento 10% sobre pró-labore líquido
- [x] Pró-labore como salário fixo do empresário
- [x] Filtros por mês/ano em todas as páginas
- [x] Status de pagamento com cores (pago/pendente/atrasado)
- [x] Responsividade desktop-first (funcional no mobile)
