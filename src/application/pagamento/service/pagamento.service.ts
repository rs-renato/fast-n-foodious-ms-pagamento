import { Inject, Injectable } from '@nestjs/common';
import { IPagamentoService } from 'src/application/pagamento/service/pagamento.service.interface';
import {
  ConsultaEstadoPagamentoPedidoUseCase,
  SolicitaPagamentoPedidoUseCase,
} from 'src/application/pagamento/usecase';
import { GerarQrCodePagamentoPedidoUseCase } from 'src/application/pagamento/usecase/gerar-qrcode-pagamento-pedido.usecase';
import { WebhookPagamentoPedidoUseCase } from 'src/application/pagamento/usecase/webhook-pagamento-pedido.usecase';
import { EstadoPagamento } from 'src/enterprise/pagamento/enum/estado-pagamento.enum';
import { Pagamento } from 'src/enterprise/pagamento/model/pagamento.model';
import { PagamentoConstants } from 'src/shared/constants';

@Injectable()
export class PagamentoService implements IPagamentoService {
  constructor(
    @Inject(PagamentoConstants.CONSULTA_ESTADO_PAGAMENTO_USECASE)
    private consultaEstadoUsecase: ConsultaEstadoPagamentoPedidoUseCase,
    @Inject(PagamentoConstants.SOLICITA_PAGAMENTO_PEDIDO_USECASE)
    private solicitarPagamentoPedidoUsecase: SolicitaPagamentoPedidoUseCase,
    @Inject(PagamentoConstants.WEBHOOK_PAGAMENTO_PEDIDO_USECASE)
    private webhookPagamentoPedidoUseCase: WebhookPagamentoPedidoUseCase,
    @Inject(PagamentoConstants.GERAR_QRCODE_PAGAMENTO_PEDIDO_USECASE)
    private gerarQrCodePagamentoPedidoUseCase: GerarQrCodePagamentoPedidoUseCase,
  ) {}

  async buscarEstadoPagamentoPedido(pedidoId: number): Promise<{ estadoPagamento: EstadoPagamento }> {
    return await this.consultaEstadoUsecase.buscaEstadoPagamento(pedidoId);
  }

  async solicitarPagamentoPedido(pedidoId: number, totalPedido: number): Promise<[Pagamento, string]> {
    const pagamento = await this.solicitarPagamentoPedidoUsecase.solicitaPagamento(pedidoId, totalPedido);
    const qrCode = await this.gerarQrCodePagamentoPedidoUseCase.gerarQrCode(pagamento);
    return [pagamento, qrCode];
  }

  async webhookPagamentoPedido(transacaoId: string, estadoPagamento: number): Promise<boolean> {
    await this.webhookPagamentoPedidoUseCase.webhook(transacaoId, estadoPagamento);
    return true;
  }
}
