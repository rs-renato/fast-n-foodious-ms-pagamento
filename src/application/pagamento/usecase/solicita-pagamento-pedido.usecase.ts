import { Inject, Injectable, Logger } from '@nestjs/common';
import { ServiceException } from 'src/enterprise/exception/service.exception';
import { EstadoPagamento } from 'src/enterprise/pagamento/enum/estado-pagamento.enum';
import { Pagamento } from 'src/enterprise/pagamento/model/pagamento.model';
import { IRepository } from 'src/enterprise/repository/repository';
import { PagamentoConstants } from 'src/shared/constants';
import { RandomIdGeneratorUtils } from 'src/shared/random.id.generator.utils';
import { PagamentoValidator } from '../validation/pagamento.validator';
import { ValidatorUtils } from 'src/shared';

@Injectable()
export class SolicitaPagamentoPedidoUseCase {
  private logger = new Logger(SolicitaPagamentoPedidoUseCase.name);

  constructor(
    @Inject(PagamentoConstants.IREPOSITORY) private repository: IRepository<Pagamento>,
    @Inject(PagamentoConstants.PAGAMENTO_VALIDATOR) private validators: PagamentoValidator[],
  ) {}

  async solicitaPagamento(pedidoId: number, totalPedido: number): Promise<Pagamento> {
    const transacaoId = RandomIdGeneratorUtils.generate('transacaoId', pedidoId);
    const pagamento: Pagamento = {
      pedidoId: pedidoId,
      transacaoId: transacaoId,
      estadoPagamento: EstadoPagamento.PENDENTE,
      total: totalPedido,
      dataHoraPagamento: undefined,
    };

    await ValidatorUtils.executeValidators(this.validators, pagamento);

    return await this.repository
      .save(pagamento)
      .then((pagamento) => {
        return pagamento;
      })
      .catch((error) => {
        this.logger.error(`Erro ao criar pagamento no banco de dados: ${error} `);
        throw new ServiceException(`Houve um erro ao consultar o pagamento: ${error}`);
      });
  }
}
