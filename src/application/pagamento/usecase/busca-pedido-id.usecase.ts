import { Inject, Injectable, Logger } from '@nestjs/common';
import { PedidoIntegration } from 'src/integration/pedido/pedido.integration';
import { PedidoDto } from 'src/enterprise/pedido/pedido-dto';

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
