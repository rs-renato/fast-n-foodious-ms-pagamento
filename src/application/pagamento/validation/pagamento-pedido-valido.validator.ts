import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';

import { PedidoDto } from 'src/enterprise/pedido/pedido-dto';
import { EstadoPedido } from 'src/enterprise/pedido/estado-pedido';
import { Pagamento } from 'src/enterprise/pagamento/model/pagamento.model';
import { PedidoIntegration } from 'src/integration/pedido/pedido.integration';
import { ValidationException } from 'src/enterprise/exception/validation.exception';
import { PagamentoValidator } from 'src/application/pagamento/validation/pagamento.validator';

@Injectable()
export class PagamentoPedidoValidoValidator implements PagamentoValidator {
  public static PEDIDO_INEXISTENTE_ERROR_MESSAGE = 'Código de pedido inexistente';
  public static MS_PEDIDO_ERROR_MESSAGE = 'Ocorreu um erro ao realizar a integração com o MS de Pedido';
  public static PEDIDO_JA_PAGO_ERROR_MESSAGE = 'O pedido já foi pago, não sendo possível alterar seu estado novamente.';
  public static VALOR_TOTAL_DIVERGENTE_ERROR_MESSAGE =
    'O valor total solicitado para pagamento diverge do valor total do pedido.';

  private logger: Logger = new Logger(PagamentoPedidoValidoValidator.name);

  constructor(@Inject(PedidoIntegration) private pedidoIntegration: PedidoIntegration) {}

  async validate({ pedidoId, total }: Pagamento): Promise<boolean> {
    this.logger.log(
      `Inicializando validação ${PagamentoPedidoValidoValidator.name} para validar o estado do pedido id: ${pedidoId}`,
    );

    let pedido: PedidoDto;
    try {
      pedido = await this.pedidoIntegration.getPedidoById(pedidoId);
    } catch (error) {
      this.logger.error(`Erro ao buscar pedido por id - ${pedidoId}: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw new ValidationException(PagamentoPedidoValidoValidator.PEDIDO_INEXISTENTE_ERROR_MESSAGE);
      }
      throw new ValidationException(PagamentoPedidoValidoValidator.MS_PEDIDO_ERROR_MESSAGE);
    }

    if (pedido.estadoPedido !== EstadoPedido.PAGAMENTO_PENDENTE) {
      this.logger.debug(`O estado do pedido precisa ser PAGAMENTO_PENDENTE, mas é ${pedido.estadoPedido}`);
      throw new ValidationException(PagamentoPedidoValidoValidator.PEDIDO_JA_PAGO_ERROR_MESSAGE);
    }

    if (pedido.total !== total) {
      this.logger.debug(
        `O total solicitado para pagamento: ${total}, diverge do total do pedido que é ${pedido.total}`,
      );
      throw new ValidationException(PagamentoPedidoValidoValidator.VALOR_TOTAL_DIVERGENTE_ERROR_MESSAGE);
    }

    return true;
  }
}
