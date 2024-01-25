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
   ) {
   }

   async solicitaPagamento(pedidoId: number, totalPedido: number): Promise<Pagamento> {
      const pagamento = await this.buscaPagamentoPorPedidoId(pedidoId);
      this.logger.debug(`Pagamento1: ${JSON.stringify(pagamento)}`);

      if (pagamento === undefined) {
         return await this.salvaNovoPagamento(pedidoId, totalPedido);
      }

      return await this.atualizaPagamentoExistente(pagamento);
   }

   private async atualizaPagamentoExistente(pagamento: Pagamento): Promise<Pagamento> {
      await ValidatorUtils.executeValidators(this.validators, pagamento);
      return await this.repository
         .edit(pagamento)
         .then((pagamento) => {
         return pagamento;
      })
         .catch((error) => {
            this.logger.error(`Erro ao atualizar pagamento no banco de dados: ${error} `);
            throw new ServiceException(`Houve um erro ao atualizar o pagamento: ${error}`);
         });
   }

   private async salvaNovoPagamento(pedidoId: number, totalPedido: number): Promise<Pagamento> {
      const transacaoId = RandomIdGeneratorUtils.generate('transacaoId', pedidoId);
      const pagamento: Pagamento = {
         pedidoId: pedidoId,
         transacaoId: transacaoId,
         estadoPagamento: EstadoPagamento.PENDENTE,
         total: totalPedido,
         dataHoraPagamento: undefined,
      };

      await ValidatorUtils.executeValidators(this.validators, pagamento);

      const pagamentoSalvo = await this.repository
         .save(pagamento)
         .then((pagamento) => {
            return pagamento;
         })
         .catch((error) => {
            this.logger.error(`Erro ao criar pagamento no banco de dados: ${error} `);
            throw new ServiceException(`Houve um erro ao criar o pagamento: ${error}`);
         });

      this.logger.debug(`PagamentoSalvo: ${JSON.stringify(pagamentoSalvo)}`);
      return pagamentoSalvo;
   }

   private async buscaPagamentoPorPedidoId(pedidoId: number): Promise<Pagamento | undefined> {
      return await this.repository
         .findBy({ pedidoId })
         .then((pagamentos) => {
            if (pagamentos.length > 0) {
               return pagamentos[0];
            }
         })
         .catch((error) => {
            this.logger.error(`Erro ao consultar pagamento no banco de dados: ${error} `);
            throw new ServiceException(`Houve um erro ao consultar o pagamento: ${error}`);
         });
   }
}
