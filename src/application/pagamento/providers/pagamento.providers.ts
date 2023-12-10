import { Provider } from '@nestjs/common';

import { PagamentoService } from 'src/application/pagamento/service/pagamento.service';
import {
   ConsultaEstadoPagamentoPedidoUseCase,
   SolicitaPagamentoPedidoUseCase,
   WebhookPagamentoPedidoUseCase,
} from 'src/application/pagamento/usecase';
import { WebhookPagamentoPagamentoValidoValidator } from 'src/application/pagamento/validation/webhook-pagamento-pagamento-valido-validator.service';
import { WebhookPagamentoPedidoValidoValidator } from 'src/application/pagamento/validation/webhook-pagamento-pedido-valido-validator.service';
import { WebhookPagamentoTransacaoIdValidoValidator } from 'src/application/pagamento/validation/webhook-pagamento-transacao-id-valido.validator';
import { WebhookPagamentoValidator } from 'src/application/pagamento/validation/webhook-pagamento.validator';
import { Pagamento } from 'src/enterprise/pagamento/model/pagamento.model';
import { IRepository } from 'src/enterprise/repository/repository';
import { PagamentoConstants } from 'src/shared/constants';

export const PagamentoProviders: Provider[] = [
   {
      provide: PagamentoConstants.ISERVICE,
      useClass: PagamentoService,
   },
   {
      provide: PagamentoConstants.CONSULTA_ESTADO_PAGAMENTO_USECASE,
      inject: [PagamentoConstants.IREPOSITORY],
      useFactory: (repository: IRepository<Pagamento>): ConsultaEstadoPagamentoPedidoUseCase =>
         new ConsultaEstadoPagamentoPedidoUseCase(repository),
   },
   {
      provide: PagamentoConstants.SOLICITA_PAGAMENTO_PEDIDO_USECASE,
      inject: [PagamentoConstants.IREPOSITORY],
      useFactory: (repository: IRepository<Pagamento>): SolicitaPagamentoPedidoUseCase =>
         new SolicitaPagamentoPedidoUseCase(repository),
   },
   {
      provide: PagamentoConstants.WEBHOOK_PAGAMENTO_PEDIDO_USECASE,
      inject: [PagamentoConstants.IREPOSITORY, PagamentoConstants.WEBHOOK_PAGAMENTO_VALIDATOR],
      useFactory: (
         repository: IRepository<Pagamento>,
         validators: WebhookPagamentoValidator[],
      ): WebhookPagamentoPedidoUseCase => new WebhookPagamentoPedidoUseCase(repository, validators),
   },
   {
      provide: PagamentoConstants.WEBHOOK_PAGAMENTO_VALIDATOR,
      inject: [PagamentoConstants.IREPOSITORY],
      useFactory: (repositoryPagamento: IRepository<Pagamento>): WebhookPagamentoValidator[] => [
         new WebhookPagamentoTransacaoIdValidoValidator(repositoryPagamento),
         new WebhookPagamentoPedidoValidoValidator(repositoryPagamento),
         new WebhookPagamentoPagamentoValidoValidator(repositoryPagamento),
      ],
   },
];
