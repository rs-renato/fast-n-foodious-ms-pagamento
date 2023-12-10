# TODOs da conversão para microserviços

* adicionar módulo de integração
  * método para carregar dados de pedido por id
  * método para confirmar pagamento no MS de pedido: passar pedido para estado RECEBIDO

* arquivo `src/application/pagamento/usecase/webhook-pagamento-pedido.usecase.ts`:
  * Must: inserir chamada para endpoint de pedido para confirmar pagamento
  * Should: extrair método `buscarPagamento(transacaoId: string)` para usecase e reutilizar?

* arquivo `src/application/pagamento/validation/webhook-pagamento-pedido-valido-validator.service.ts`:
  * Must: criar usecase para receber dados de pedido por id
  * Should: inserir chamada para endpoint de pedido para confirmar pagamento

* ampliar cobertura de testes unitários
```
----------------------------------------------------------|---------|----------|---------|---------|-------------------
File                                                      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------------------------------------------------------|---------|----------|---------|---------|-------------------
All files                                                 |   72.02 |    16.66 |      68 |   70.81 |
application/pagamento/service                            |   84.61 |      100 |      75 |   83.33 |
pagamento.service.ts                                    |   84.61 |      100 |      75 |   83.33 | 32-33
application/pagamento/usecase                            |    62.5 |    16.66 |      60 |   60.65 |
consulta-estado-pagamento-pedido.usecase.ts             |     100 |      100 |     100 |     100 |
solicita-pagamento-pedido.usecase.ts                    |     100 |      100 |     100 |     100 |
webhook-pagamento-pedido.usecase.ts                     |   33.33 |        0 |   14.28 |   31.42 | 22-88
application/pagamento/validation                         |   53.44 |       20 |   35.71 |   53.44 |
webhook-pagamento-pagamento-valido-validator.service.ts |   38.46 |        0 |   16.66 |   38.46 | 21-59
webhook-pagamento-pedido-valido-validator.service.ts    |    42.1 |        0 |      20 |    42.1 | 20-59
webhook-pagamento-transacao-id-valido.validator.ts      |     100 |      100 |     100 |     100 |
infrastructure/persistence/pagamento/repository          |     100 |      100 |     100 |     100 |
pagamento-typeorm.repository.ts                         |     100 |      100 |     100 |     100 |
presentation/rest                                        |     100 |      100 |     100 |     100 |
base.api.ts                                             |     100 |      100 |     100 |     100 |
presentation/rest/health/api                             |     100 |      100 |     100 |     100 |
health.api.ts                                           |     100 |      100 |     100 |     100 |
presentation/rest/pagamento/api                          |   95.23 |        0 |     100 |      95 |
pagamento.api.ts                                        |   95.23 |        0 |     100 |      95 | 51
----------------------------------------------------------|---------|----------|---------|---------|-------------------
Jest: "global" coverage threshold for branches (70%) not met: 16.66%
Jest: "global" coverage threshold for functions (70%) not met: 68%
```