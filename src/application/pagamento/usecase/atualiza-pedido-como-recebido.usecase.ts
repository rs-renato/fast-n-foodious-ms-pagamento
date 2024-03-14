import { Inject, Injectable, Logger } from '@nestjs/common';
import { SqsIntegration } from 'src/integration/sqs/sqs.integration';
import { Pagamento } from 'src/enterprise/pagamento/model/pagamento.model';

@Injectable()
export class AtualizaPedidoComoRecebidoUseCase {
  private logger = new Logger(AtualizaPedidoComoRecebidoUseCase.name);

  constructor(@Inject(SqsIntegration) private sqsIntegration: SqsIntegration) {}

  async atualizarPagamentoPedidoComoRecebido(pagamento: Pagamento): Promise<void> {
    this.logger.debug(`atualizarPagamentoPedidoComoRecebido: pagamento = ${JSON.stringify(pagamento)}`);
    await this.sqsIntegration.sendEstadoPagamentoPedido(pagamento);
  }
}
