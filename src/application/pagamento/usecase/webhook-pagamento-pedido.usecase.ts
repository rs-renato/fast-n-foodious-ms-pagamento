import { Inject, Injectable, Logger } from '@nestjs/common';
import { WebhookPagamentoValidator } from 'src/application/pagamento/validation/webhook-pagamento.validator';
import { ServiceException } from 'src/enterprise/exception/service.exception';
import { ValidationException } from 'src/enterprise/exception/validation.exception';
import { EstadoPagamento, getEstadoPagamentoFromValue } from 'src/enterprise/pagamento/enum/estado-pagamento.enum';
import { Pagamento } from 'src/enterprise/pagamento/model/pagamento.model';

import { IRepository } from 'src/enterprise/repository/repository';
import { PagamentoConstants } from 'src/shared/constants';
import { ValidatorUtils } from 'src/shared/validator.utils';
import { PedidoIntegration } from '../../../integration/pedido/pedido.integration';
import { PedidoDto } from '../../../integration/pedido/pedido-dto.integration';
import { BuscaPedidoIdUseCase } from './busca-pedido-id.usecase';

@Injectable()
export class WebhookPagamentoPedidoUseCase {
   private logger = new Logger(WebhookPagamentoPedidoUseCase.name);

   constructor(
      @Inject(PagamentoConstants.IREPOSITORY) private repository: IRepository<Pagamento>,
      @Inject(PagamentoConstants.BUSCA_PEDIDO_ID_USECASE) private buscaPedidoIdUseCase: BuscaPedidoIdUseCase,
      @Inject(PagamentoConstants.WEBHOOK_PAGAMENTO_VALIDATOR) private validators: WebhookPagamentoValidator[],
   ) {}

   async webhook(transacaoId: string, estadoPagamento: number): Promise<boolean> {
      this.logger.log(`Webhook: ativado para transaçãoId = ${transacaoId} para estado = ${estadoPagamento}\n`);

      const estadoPagamentoEnum: EstadoPagamento = this.constroiEstadoPagamentoEnum(estadoPagamento);
      const pagamentoParaValidar = new Pagamento(undefined, transacaoId, undefined, undefined, undefined, undefined);
      await ValidatorUtils.executeValidators(this.validators, pagamentoParaValidar);

      // buscar pagamento associado a transaçãoID
      const pagamento = await this.buscarPagamento(transacaoId);

      // mudar status pagamento para o estado CONFIRMADO
      pagamento.estadoPagamento = estadoPagamentoEnum;
      pagamento.dataHoraPagamento = pagamento.estadoPagamento === EstadoPagamento.CONFIRMADO ? new Date() : null;
      await this.repository.edit(pagamento);

      // mudar status pedido para RECEBIDO se o pagamento foi CONFIRMADO
      await this.mudarEstadoPedidoParaRecebidoSePagamentoConfirmado(estadoPagamentoEnum, pagamento);

      this.logger.log(`Webhook: finalizado para transaçãoId = ${transacaoId}\n`);
      return true;
   }

   private constroiEstadoPagamentoEnum(estadoPagamento: number): EstadoPagamento {
      const estadoPagamentoFromValue = getEstadoPagamentoFromValue(estadoPagamento);
      if (estadoPagamentoFromValue === undefined) {
         throw new ValidationException(
            `Estado de pagamento válidos são 1 (Confirmado) e 2 (Rejeitado). O estado de pagamento informado é inválido: ${estadoPagamento}`,
         );
      }
      return estadoPagamentoFromValue;
   }

   private async mudarEstadoPedidoParaRecebidoSePagamentoConfirmado(estadoPagamentoEnum: EstadoPagamento,
                                                                    pagamento: Pagamento): Promise<void> {
      if (estadoPagamentoEnum === EstadoPagamento.CONFIRMADO) {

         // buscar pedido associado a transaçãoID
         const pedido: PedidoDto =  await this.buscaPedidoIdUseCase.buscarPedidoPorId(pagamento.pedidoId);
         this.logger.debug(`PedidoDto = ${JSON.stringify(pedido)}`);

         // TODO RODRIGO - inserir chamada para o endpoint editar o pedido
         // // mudar status pedido para RECEBIDO
         // pedido.estadoPedido = EstadoPedido.RECEBIDO;
         // await this.editarPedidoUseCase.editarPedido(pedido);
      }
   }

private async buscarPagamento(transacaoId: string): Promise<Pagamento> {
      const pagamento = await this.repository
         .findBy({ transacaoId: transacaoId })
         .then((pagamentos: Pagamento[]) => {
            return pagamentos[0];
         })
         .catch((error) => {
            this.logger.error(
               `Erro ao buscar pagamento associado a transação ${transacaoId} no banco de dados: ${error} `,
            );
            throw new ServiceException(
               `Erro ao buscar pagamento associado a transação ${transacaoId} no banco de dados: ${error} `,
            );
         });
      if (pagamento === undefined) {
         this.logger.error(`Nenhum pagamento associado a transação ${transacaoId} foi localizado no banco de dados`);
         throw new ServiceException(
            `Nenhum pagamento associado a transação ${transacaoId} foi localizado no banco de dados`,
         );
      }
      return pagamento;
   }
}
