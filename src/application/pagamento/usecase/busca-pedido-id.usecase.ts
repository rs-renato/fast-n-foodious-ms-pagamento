import { Inject, Injectable, Logger } from '@nestjs/common';
import { ServiceException } from 'src/enterprise/exception/service.exception';
import { ValidationException } from 'src/enterprise/exception/validation.exception';
import { EstadoPagamento, getEstadoPagamentoFromValue } from 'src/enterprise/pagamento/enum/estado-pagamento.enum';
import { Pagamento } from 'src/enterprise/pagamento/model/pagamento.model';
import { ValidatorUtils } from 'src/shared/validator.utils';
import { PedidoIntegration } from '../../../integration/pedido/pedido.integration';
import { PedidoDto } from '../../../integration/pedido/pedido-dto.integration';

@Injectable()
export class BuscaPedidoIdUseCase {
   private logger = new Logger(BuscaPedidoIdUseCase.name);

   constructor(@Inject(PedidoIntegration) private pedidoIntegration: PedidoIntegration) {}

   async buscarPedidoPorId(idPedido: number): Promise<PedidoDto> {
      this.logger.log(`buscarPedidoPorId: id = ${idPedido}`);
      const pedidoDto = await this.pedidoIntegration.getPedidoById(idPedido);
      this.logger.debug(`pedidoDto = ${JSON.stringify(pedidoDto)}`);
      return pedidoDto;
   }

}
