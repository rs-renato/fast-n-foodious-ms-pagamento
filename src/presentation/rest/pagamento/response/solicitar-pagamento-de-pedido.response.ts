import { ApiProperty } from '@nestjs/swagger';
import { Pagamento } from 'src/enterprise/pagamento/model/pagamento.model';
import { PagamentoResponseDto } from 'src/presentation/rest/dto/PagamentoResponseDto';
import { Logger } from '@nestjs/common';

export class SolicitacaoPagamentoResponse {
  @ApiProperty({ required: true, nullable: false, description: 'Informações do pagamento solicitado' })
  public pagamento: PagamentoResponseDto;

  @ApiProperty({ required: true, nullable: false, description: 'QrCode de pagamento' })
  public qrCode: string;

  constructor(pagamento: Pagamento, qrCode: string) {
    const logger = new Logger(SolicitacaoPagamentoResponse.name);
    logger.debug(`Pagamento = ${JSON.stringify(pagamento)}`);

    let idPagamento: number | string;
    if (pagamento._id !== undefined) {
      logger.debug(`Pagamento._id = ${JSON.stringify(pagamento._id)}`);
      idPagamento = pagamento._id;
    } else {
      logger.debug(`Pagamento.id = ${JSON.stringify(pagamento.id)}`);
      idPagamento = pagamento.id;
    }
    this.pagamento = {
      pedidoId: pagamento.pedidoId,
      transacaoId: pagamento.transacaoId,
      estadoPagamento: pagamento.estadoPagamento,
      total: pagamento.total,
      dataHoraPagamento: pagamento.dataHoraPagamento,
      id: idPagamento,
    };
    this.qrCode = qrCode;
    logger.debug(`PagamentoResponseDto = ${JSON.stringify(this)}`);
  }
}
