import { Inject, Injectable, Logger } from '@nestjs/common';
import { ServiceException } from 'src/enterprise/exception/service.exception';
import { ValidationException } from 'src/enterprise/exception/validation.exception';
import { EstadoPagamento, getEstadoPagamentoFromValue } from 'src/enterprise/pagamento/enum/estado-pagamento.enum';
import { Pagamento } from 'src/enterprise/pagamento/model/pagamento.model';
import { ValidatorUtils } from 'src/shared/validator.utils';
import { PedidoIntegration } from 'src/integration/pedido/pedido.integration';
import { PedidoDto } from 'src/enterprise/pedido/pedido-dto';
import { EstadoPedido } from 'src/enterprise/pedido/estado-pedido';

@Injectable()
export class AtualizaPedidoComoRecebidoUseCase {
   private logger = new Logger(AtualizaPedidoComoRecebidoUseCase.name);

   constructor(@Inject(PedidoIntegration) private pedidoIntegration: PedidoIntegration) {}

   async atualizarPedidoComoRecebido(pedidoDto: PedidoDto): Promise<void> {
      this.logger.debug(`atualizarPedidoComoRecebido: pedidoDto = ${JSON.stringify(pedidoDto)}`);
      pedidoDto.estadoPedido = EstadoPedido.RECEBIDO;
      await this.pedidoIntegration.editarPedido(pedidoDto);
      this.logger.debug(`Estado do pedido ${pedidoDto.id} modificado com sucesso para ${pedidoDto.estadoPedido}`);
   }

}
