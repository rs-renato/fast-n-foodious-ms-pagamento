import { Inject, Injectable, Logger } from '@nestjs/common';
import { ServiceException } from 'src/enterprise/exception/service.exception';
import { Pagamento } from 'src/enterprise/pagamento/model/pagamento.model';
import { PagamentoConstants } from 'src/shared/constants';
import { IRepository } from 'src/enterprise/repository/repository';
import { NaoEncontradoApplicationException } from 'src/application/exception/nao-encontrado.exception';

@Injectable()
export class ConsultaPagamentoPedidoUseCase {
  private logger = new Logger(ConsultaPagamentoPedidoUseCase.name);

  constructor(@Inject(PagamentoConstants.IREPOSITORY) private repository: IRepository<Pagamento>) {}

  async buscaPagamentoPorIdPedido(pedidoId: number): Promise<Pagamento> {
    const pagamento = await this.repository.findBy({ pedidoId }).catch((error) => {
      this.logger.error(`Erro ao consultar pagamento no banco de dados: ${error} `);
      throw new ServiceException(`Houve um erro ao consultar o pagamento: ${error}`);
    });

    if (!pagamento.length) {
      this.logger.error(`Pagamento para o Pedido id=${pedidoId} não encontrado`);
      throw new NaoEncontradoApplicationException('Pagamento para o pedido não encontrado');
    }

    return pagamento[0];
  }
}
