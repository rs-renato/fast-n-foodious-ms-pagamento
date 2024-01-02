* para adicionar o axios:
    * npm i --save @nestjs/axios
    * criar o módulo de integração: src/integration
        * para cada integração, criar um diretório; exemplo para pedido: src/integration/pedido/pedido.integration.ts
    * criar providers: src/integration/providers/integration.providers.ts
        * exemplo:
          ```
          export const IntegrationProviders: Provider[] = [
             {
                provide: PedidoIntegration,
                useClass: PedidoIntegration,
             },
          ];
          ```
    * nos módulos onde forem serem usadas as integrações, adicionar o HttpModule em imports e os IntegrationProviders em providers:
        * exemplo:
          ```
          @Module({
             imports: [HttpModule],
             providers: [...IntegrationProviders, ...PagamentoProviders],
             exports: [{ provide: PagamentoConstants.ISERVICE, useClass: PagamentoService }],
          })
          export class ApplicationModule {}
          ```
    * adicionar a classe de integration desejada ao construtor do usecase
        * exemplo de adição de PedidoIntegration à WEBHOOK_PAGAMENTO_PEDIDO_USECASE em src/application/pagamento/providers/pagamento.providers.ts:
      ```
         {
            provide: PagamentoConstants.WEBHOOK_PAGAMENTO_PEDIDO_USECASE,
            inject: [PagamentoConstants.IREPOSITORY, PedidoIntegration, PagamentoConstants.WEBHOOK_PAGAMENTO_VALIDATOR],
            useFactory: (
               repository: IRepository<Pagamento>,
               pedidoIntegration: PedidoIntegration,
               validators: WebhookPagamentoValidator[],
            ): WebhookPagamentoPedidoUseCase => new WebhookPagamentoPedidoUseCase(repository, pedidoIntegration, validators),
         },
      ```