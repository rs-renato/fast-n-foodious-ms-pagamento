import { Inject, Injectable, Logger } from '@nestjs/common';
import { WebhookPagamentoValidator } from 'src/application/pagamento/validation/webhook-pagamento.validator';
import { ServiceException } from 'src/enterprise/exception/service.exception';
import { ValidationException } from 'src/enterprise/exception/validation.exception';
import { Pagamento } from 'src/enterprise/pagamento/model/pagamento.model';
import { IRepository } from 'src/enterprise/repository/repository';
import { PagamentoConstants } from 'src/shared/constants';
import { BuscaPedidoIdUseCase } from 'src/application/pagamento/usecase/busca-pedido-id.usecase';
import { PedidoDto } from 'src/enterprise/pedido/pedido-dto';
import { EstadoPedido } from 'src/enterprise/pedido/estado-pedido';
import { NaoEncontradoApplicationException } from 'src/application/exception/nao-encontrado.exception';
import { IntegrationApplicationException } from 'src/application/exception/integration-application.exception';

@Injectable()
export class WebhookPagamentoPedidoValidoValidator implements WebhookPagamentoValidator {
  public static PEDIDO_INEXISTENTE_ERROR_MESSAGE = 'Código de pedido inexistente';
  public static MS_PEDIDO_ERROR_MESSAGE = 'Ocorreu um erro ao realizar a integração com o MS de Pedido';
  public static PEDIDO_JA_PAGO_ERROR_MESSAGE = 'O pedido já foi pago, não sendo possível alterar seu estado novamente.';

  private logger: Logger = new Logger(WebhookPagamentoPedidoValidoValidator.name);

  constructor(
    @Inject(PagamentoConstants.IREPOSITORY) private repositoryPagamento: IRepository<Pagamento>,
    @Inject(PagamentoConstants.BUSCA_PEDIDO_ID_USECASE) private buscaPedidoIdUseCase: BuscaPedidoIdUseCase,
  ) {}

  async validate({ transacaoId }: Pagamento): Promise<boolean> {
    const pagamento = await this.buscarPagamento(transacaoId);
    this.logger.log(
      `Inicializando validação ${WebhookPagamentoPedidoValidoValidator.name} para validar o estado do pedido id: ${pagamento.pedidoId}`,
    );

    let pedido: PedidoDto;
    try {
      pedido = await this.buscaPedidoIdUseCase.buscarPedidoPorId(pagamento.pedidoId);
    } catch (error) {
      this.logger.error(`Erro ao buscar pedido por id: ${error.message}`);
      if (error instanceof NaoEncontradoApplicationException) {
        throw new ValidationException(WebhookPagamentoPedidoValidoValidator.PEDIDO_INEXISTENTE_ERROR_MESSAGE);
      }
      throw new IntegrationApplicationException(WebhookPagamentoPedidoValidoValidator.MS_PEDIDO_ERROR_MESSAGE);
    }

    if (pedido.estadoPedido !== EstadoPedido.PAGAMENTO_PENDENTE && pedido.estadoPedido !== EstadoPedido.CHECKOUT) {
      this.logger.debug(`O estado do pedido precisa ser PAGAMENTO_PENDENTE/CHECKOUT, mas é ${pedido.estadoPedido}`);
      throw new ValidationException(WebhookPagamentoPedidoValidoValidator.PEDIDO_JA_PAGO_ERROR_MESSAGE);
    }

    return true;
  }

  private async buscarPagamento(transacaoId: string): Promise<Pagamento> {
    const pagamento = await this.repositoryPagamento.findBy({ transacaoId }).catch((error) => {
      const errorMessage = `Erro ao buscar pagamento associado a transação ${transacaoId} no banco de dados: ${error}`;
      this.logger.error(errorMessage);
      throw new ServiceException(errorMessage);
    });
    if (!pagamento.length) {
      const errorPagamentoUndefined = `Nenhum pagamento associado a transação ${transacaoId} foi localizado no banco de dados`;
      this.logger.error(errorPagamentoUndefined);
      throw new NaoEncontradoApplicationException(errorPagamentoUndefined);
    }
    return pagamento[0];
  }
}
