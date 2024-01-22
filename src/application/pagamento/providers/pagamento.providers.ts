import { Provider } from '@nestjs/common';

import { PagamentoService } from 'src/application/pagamento/service/pagamento.service';
import {
  ConsultaEstadoPagamentoPedidoUseCase,
  SolicitaPagamentoPedidoUseCase,
  WebhookPagamentoPedidoUseCase,
} from 'src/application/pagamento/usecase';
import { WebhookPagamentoPagamentoValidoValidator } from 'src/application/pagamento/validation/webhook-pagamento-pagamento-valido-validator.service';
import { WebhookPagamentoPedidoValidoValidator } from 'src/application/pagamento/validation/webhook-pagamento-pedido-valido-validator';
import { WebhookPagamentoTransacaoIdValidoValidator } from 'src/application/pagamento/validation/webhook-pagamento-transacao-id-valido.validator';
import { WebhookPagamentoValidator } from 'src/application/pagamento/validation/webhook-pagamento.validator';
import { Pagamento } from 'src/enterprise/pagamento/model/pagamento.model';
import { IRepository } from 'src/enterprise/repository/repository';
import { PagamentoConstants } from 'src/shared/constants';
import { PedidoIntegration } from 'src/integration/pedido/pedido.integration';
import { BuscaPedidoIdUseCase } from 'src/application/pagamento/usecase/busca-pedido-id.usecase';
import { AtualizaPedidoComoRecebidoUseCase } from 'src/application/pagamento/usecase/atualiza-pedido-como-recebido.usecase';
import { PagamentoValidator } from '../validation/pagamento.validator';
import { PagamentoPedidoValidoValidator } from '../validation/pagamento-pedido-valido.validator';

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
    inject: [PagamentoConstants.IREPOSITORY, PagamentoConstants.PAGAMENTO_VALIDATOR],
    useFactory: (
      repository: IRepository<Pagamento>,
      validators: PagamentoValidator[],
    ): SolicitaPagamentoPedidoUseCase => new SolicitaPagamentoPedidoUseCase(repository, validators),
  },
  {
    provide: PagamentoConstants.WEBHOOK_PAGAMENTO_PEDIDO_USECASE,
    inject: [
      PagamentoConstants.IREPOSITORY,
      PagamentoConstants.BUSCA_PEDIDO_ID_USECASE,
      PagamentoConstants.ATUALIZA_PEDIDO_COMO_RECEBIDO_USECASE,
      PagamentoConstants.WEBHOOK_PAGAMENTO_VALIDATOR,
    ],
    useFactory: (
      repository: IRepository<Pagamento>,
      buscaPedidoIdUseCase: BuscaPedidoIdUseCase,
      atualizaPedidoComoRecebidoUseCase: AtualizaPedidoComoRecebidoUseCase,
      validators: WebhookPagamentoValidator[],
    ): WebhookPagamentoPedidoUseCase =>
      new WebhookPagamentoPedidoUseCase(
        repository,
        buscaPedidoIdUseCase,
        atualizaPedidoComoRecebidoUseCase,
        validators,
      ),
  },
  {
    provide: PagamentoConstants.BUSCA_PEDIDO_ID_USECASE,
    inject: [PedidoIntegration],
    useFactory: (pedidoIntegration: PedidoIntegration): BuscaPedidoIdUseCase =>
      new BuscaPedidoIdUseCase(pedidoIntegration),
  },
  {
    provide: PagamentoConstants.ATUALIZA_PEDIDO_COMO_RECEBIDO_USECASE,
    inject: [PedidoIntegration],
    useFactory: (pedidoIntegration: PedidoIntegration): AtualizaPedidoComoRecebidoUseCase =>
      new AtualizaPedidoComoRecebidoUseCase(pedidoIntegration),
  },
  {
    provide: PagamentoConstants.WEBHOOK_PAGAMENTO_VALIDATOR,
    inject: [PagamentoConstants.IREPOSITORY, PagamentoConstants.BUSCA_PEDIDO_ID_USECASE],
    useFactory: (
      repositoryPagamento: IRepository<Pagamento>,
      buscaPedidoIdUseCase: BuscaPedidoIdUseCase,
    ): WebhookPagamentoValidator[] => [
      new WebhookPagamentoTransacaoIdValidoValidator(repositoryPagamento),
      new WebhookPagamentoPedidoValidoValidator(repositoryPagamento, buscaPedidoIdUseCase),
      new WebhookPagamentoPagamentoValidoValidator(repositoryPagamento),
    ],
  },
  {
    provide: PagamentoConstants.PAGAMENTO_VALIDATOR,
    inject: [PedidoIntegration],
    useFactory: (pedidoIntegration: PedidoIntegration): PagamentoValidator[] => [
      new PagamentoPedidoValidoValidator(pedidoIntegration),
    ],
  },
];
