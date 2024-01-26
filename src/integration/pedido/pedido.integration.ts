import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as process from 'process';
import { catchError, lastValueFrom, map } from 'rxjs';
import { IntegrationApplicationException } from 'src/application/exception/integration-application.exception';
import { NaoEncontradoApplicationException } from 'src/application/exception/nao-encontrado.exception';
import { PedidoDto } from 'src/enterprise/pedido/pedido-dto';

@Injectable()
export class PedidoIntegration {
  private logger = new Logger(PedidoIntegration.name);

  private MS_PEDIDO_URL = process.env.MS_PEDIDO_INTEGRATION_URL;

  constructor(private httpService: HttpService) {}

  async getPedidoById(id: number): Promise<PedidoDto> {
    this.logger.debug(`getPedidoById: invocando serviço de integração em http://${this.MS_PEDIDO_URL}/v1/pedido/${id}`);
    const request = this.httpService
      .get(`http://${this.MS_PEDIDO_URL}/v1/pedido/${id}`)
      .pipe(map((res) => res.data))
      .pipe(
        catchError((error) => {
          const statusError = error.response.status;
          if (statusError === HttpStatus.NOT_FOUND) {
            throw new NaoEncontradoApplicationException(`Pedido ${id} não encontrado.`);
          }
          throw new IntegrationApplicationException(
            'Não foi possível realizar a integração com o MS de Pedido para buscar o pedido.',
          );
        }),
      );

    const pedidoByIdResponse = await lastValueFrom(request);

    const pedidoDto = PedidoDto.fromJson(pedidoByIdResponse);

    this.logger.debug('pedidoByIdResponse: ' + JSON.stringify(pedidoByIdResponse));
    this.logger.debug('PedidoDTO: ' + JSON.stringify(pedidoDto));

    return pedidoDto;
  }

  async editarPedido(pedidoDto: PedidoDto): Promise<void> {
    const pedidoModificadoParaRecebido = {
      clienteId: pedidoDto.clienteId,
      dataInicio: pedidoDto.dataInicio,
      estadoPedido: pedidoDto.estadoPedido,
      ativo: pedidoDto.ativo,
    };

    this.logger.debug(
      `editarPedido: invocando serviço de integração em http://${this.MS_PEDIDO_URL}/v1/pedido/${pedidoDto.id}`,
    );
    const request = this.httpService
      .put(`http://${this.MS_PEDIDO_URL}/v1/pedido/${pedidoDto.id}`, pedidoModificadoParaRecebido)
      .pipe(map((res) => res.data))
      .pipe(
        catchError(() => {
          throw new IntegrationApplicationException(
            'Não foi possível realizar a integração com o MS de Pedido para editar o pedido.',
          );
        }),
      );

    await lastValueFrom(request);
  }
}
