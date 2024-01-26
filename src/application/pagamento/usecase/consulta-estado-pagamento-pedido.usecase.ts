import { Inject, Injectable, Logger } from '@nestjs/common';
import { ServiceException } from 'src/enterprise/exception/service.exception';
import { Pagamento } from 'src/enterprise/pagamento/model/pagamento.model';
import { PagamentoConstants } from 'src/shared/constants';
import { IRepository } from 'src/enterprise/repository/repository';
import { NaoEncontradoApplicationException } from 'src/application/exception/nao-encontrado.exception';
import { EstadoPagamento } from 'src/enterprise/pagamento/enum/estado-pagamento.enum';

@Injectable()
export class ConsultaEstadoPagamentoPedidoUseCase {
  private logger = new Logger(ConsultaEstadoPagamentoPedidoUseCase.name);

  constructor(@Inject(PagamentoConstants.IREPOSITORY) private repository: IRepository<Pagamento>) {}

  async buscaEstadoPagamento(pedidoId: number): Promise<EstadoPagamento> {
    const pagamento = await this.repository.findBy({ pedidoId }).catch((error) => {
        this.logger.error(`Erro ao consultar pagamento no banco de dados: ${error} `);
        throw new ServiceException(`Houve um erro ao consultar o pagamento: ${error}`);
    });

    if (!pagamento.length) {
      this.logger.error(`Pagamento para o Pedido id=${pedidoId} não encontrado`);
      throw new NaoEncontradoApplicationException('Pagamento para o pedido não encontrado');
    }

    return pagamento[0].estadoPagamento;
  }
}
