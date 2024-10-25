import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IPagamentoService } from 'src/application/pagamento/service/pagamento.service.interface';
import { BaseRestApi } from 'src/presentation/rest/base.api';
import { BuscarEstadoPagamentoPedidoRequest } from 'src/presentation/rest/pagamento/request';
import { BuscarEstadoPagamentoPedidoResponse } from 'src/presentation/rest/pagamento/response';
import { PagamentoConstants } from 'src/shared/constants';
import { SolicitacaoPagamentoResponse } from 'src/presentation/rest/pagamento/response/solicitar-pagamento-de-pedido.response';
import { SolicitacaoPagamentoRequest } from 'src/presentation/rest/pagamento/request/solicitar-pagamento-de-pedido.request';
import { BuscarPagamentoPedidoResponse } from 'src/presentation/rest/pagamento/response/buscar-pagamento-por-pedido.response';

@Controller('v1/pagamento')
@ApiTags('Pagamento')
export class PagamentoRestApi extends BaseRestApi {
  private logger: Logger = new Logger(PagamentoRestApi.name);

  constructor(@Inject(PagamentoConstants.ISERVICE) private service: IPagamentoService) {
    super();
  }

  @Post(':transacaoId/:estadoPagamento')
  @ApiOperation({
    summary: 'Webhook para atualização do estado do pagamento de um pedido com APROVADO = 1, REJEITADO =2',
    description: 'Confirma o pagamento de um pedido através da integração com o gateway de pagamento.',
  })
  @ApiOkResponse({
    description: 'Pagamento confirmado com sucesso',
  })
  async webhook(
    @Param('transacaoId') transacaoId: string,
    @Param('estadoPagamento') estadoPagamento: number,
  ): Promise<boolean> {
    const response = await this.service.webhookPagamentoPedido(transacaoId, estadoPagamento);
    this.logger.debug(`Estado do pagamento modificado para ${estadoPagamento} para a transactionId  ${transacaoId}.`);
    return response;
  }

  @Get('estado')
  @ApiOperation({
    summary: 'Consulta estado do pagamento por ID do Pedido',
    description:
      'Realiza consulta do estado do pagamento por ID do Pedido onde PENDENTE = 0, CONFIRMADO = 1 e REJEITADO = 2',
  })
  @ApiOkResponse({
    description: 'Estado do pagamento consultado com sucesso',
    type: BuscarEstadoPagamentoPedidoResponse,
  })
  async buscarPorPedidoId(
    @Query(ValidationPipe) query: BuscarEstadoPagamentoPedidoRequest,
  ): Promise<BuscarEstadoPagamentoPedidoResponse> {
    this.logger.debug(`Consultando estado do pagamento por ID do pedido: ${JSON.stringify(query)}`);
    return await this.service.buscarEstadoPagamentoPedido(query.pedidoId).then((estadoPagamento) => {
      return new BuscarEstadoPagamentoPedidoResponse(estadoPagamento);
    });
  }

  @Get(':pedidoId')
  @ApiOperation({
    summary: 'Consulta pagamento por ID do Pedido',
    description: 'Realiza consulta do pagamento por ID do Pedido',
  })
  @ApiOkResponse({
    description: 'Pagamento do PedidoID consultado com sucesso',
    type: BuscarPagamentoPedidoResponse,
  })
  async buscarPagamentoPorPedidoId(
    @Param('pedidoId', ParseIntPipe) pedidoId: number,
  ): Promise<BuscarPagamentoPedidoResponse> {
    this.logger.debug(`Consultando pagamento do Pedido ID: ${pedidoId}`);
    const [pagamento, qrCode] = await this.service.buscarPagamentoPedido(pedidoId);
    return new BuscarPagamentoPedidoResponse(pagamento, qrCode);
  }

  @Post('solicitar')
  @ApiOperation({
    deprecated: true,
    summary: 'Solicita pagamento para um pedido e gera o seu respectivo QRCode',
    description:
      'Registra a solicitação de pagamento para um dado pedido, gerando o código QRCode para realização do pagamento.',
  })
  @ApiOkResponse({
    description: 'Solicitação efetuada com sucesso',
    type: SolicitacaoPagamentoResponse,
  })
  async solicitarPagamentoDePedido(
    @Body() solicitacaoPagamentoRequest: SolicitacaoPagamentoRequest,
  ): Promise<SolicitacaoPagamentoResponse> {
    this.logger.debug(`Solicitando pagamento para pedido: ${JSON.stringify(solicitacaoPagamentoRequest)}`);

    const [pagamento, qrCode] = await this.service.solicitarPagamentoPedido(
      solicitacaoPagamentoRequest.pedidoId,
      solicitacaoPagamentoRequest.totalPedido,
    );
    return new SolicitacaoPagamentoResponse(pagamento, qrCode);
  }
}
