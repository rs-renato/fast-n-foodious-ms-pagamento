import { SQSClient } from '@aws-sdk/client-sqs';
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SolicitaPagamentoPedidoUseCase } from 'src/application/pagamento/usecase';
import { SqsIntegration } from 'src/integration/sqs/sqs.integration';
import { PedidoIntegration } from 'src/integration/pedido/pedido.integration';
import { PagamentoConstants } from 'src/shared/constants';

export const IntegrationProviders: Provider[] = [
  {
    provide: PedidoIntegration,
    useClass: PedidoIntegration,
  },
  {
    inject: [ConfigService, PagamentoConstants.SOLICITA_PAGAMENTO_PEDIDO_USECASE],
    provide: SqsIntegration,
    useFactory: (
      configService: ConfigService,
      solicitaPagamentoPedidoUseCase: SolicitaPagamentoPedidoUseCase,
    ): SqsIntegration =>
      new SqsIntegration(
        new SQSClient({ endpoint: configService.get('AWS_ENDPOINT') }),
        solicitaPagamentoPedidoUseCase,
      ),
  },
];
