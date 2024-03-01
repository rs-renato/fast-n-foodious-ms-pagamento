import { Test, TestingModule } from '@nestjs/testing';
import { IPagamentoService } from 'src/application/pagamento/service/pagamento.service.interface';
import { EstadoPagamento } from 'src/enterprise/pagamento/enum/estado-pagamento.enum';
import { PagamentoRestApi } from 'src/presentation/rest/pagamento/api/pagamento.api';
import { PagamentoConstants } from 'src/shared/constants';
import { BuscarEstadoPagamentoPedidoRequest } from 'src/presentation/rest/pagamento/request';
import { SolicitacaoPagamentoRequest } from 'src/presentation/rest/pagamento/request/solicitar-pagamento-de-pedido.request';
import { SolicitacaoPagamentoResponse } from 'src/presentation/rest/pagamento/response/solicitar-pagamento-de-pedido.response';
import { PagamentoResponseDto } from 'src/presentation/rest/dto/PagamentoResponseDto';
import { NaoEncontradoApplicationException } from 'src/application/exception/nao-encontrado.exception';
import { BuscarPagamentoPedidoResponse } from 'src/presentation/rest/pagamento/response/buscar-pagamento-por-pedido.response';

describe('PagamentoRestApi', () => {
  let restApi: PagamentoRestApi;
  let service: IPagamentoService;

  const qrCode = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOwAAAD';

  const buscarEstadoPagamentoPedidoRequest: BuscarEstadoPagamentoPedidoRequest = {
    pedidoId: 1,
  };

  const solicitacaoPagamentoRequest: SolicitacaoPagamentoRequest = {
    pedidoId: 1,
    totalPedido: 100,
  };

  const pagamentoSolicitado: PagamentoResponseDto = {
    pedidoId: 1,
    transacaoId: '123',
    estadoPagamento: EstadoPagamento.PENDENTE,
    total: 100,
    dataHoraPagamento: new Date(),
    id: 123,
  };

  const solicitacaoPagamentoResponse: SolicitacaoPagamentoResponse = {
    pagamento: pagamentoSolicitado,
    qrCode: qrCode,
  };

  const buscarPagamentoPedidoResponse: BuscarPagamentoPedidoResponse = {
    pagamento: pagamentoSolicitado,
    qrCode: qrCode,
  };

  beforeEach(async () => {
    // Configuração do módulo de teste
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PagamentoRestApi],
      providers: [
        {
          provide: PagamentoConstants.ISERVICE,
          useValue: {
            buscarPagamentoPedido: jest.fn(() => Promise.resolve([pagamentoSolicitado, qrCode])),
            buscarEstadoPagamentoPedido: jest.fn((pedidoId) =>
              pedidoId === 1 ? Promise.resolve(EstadoPagamento.CONFIRMADO) : Promise.reject(new Error('error')),
            ),
            webhookPagamentoPedido: jest.fn(() => Promise.resolve(true)),
            solicitarPagamentoPedido: jest.fn((pedidoId, totalPedido) =>
              pedidoId === 1 && totalPedido === 100
                ? Promise.resolve([pagamentoSolicitado, qrCode])
                : Promise.reject(new Error('error')),
            ),
          },
        },
      ],
    }).compile();

    // Desabilita a saída de log
    module.useLogger(false);

    // Obtém a instância do restApi a partir do módulo de teste
    restApi = module.get<PagamentoRestApi>(PagamentoRestApi);
    service = module.get<IPagamentoService>(PagamentoConstants.ISERVICE);
  });

  describe('injeção de dependências', () => {
    it('deve existir instância de serviço definida', async () => {
      // Verifica se a instância de serviço está definida
      expect(service).toBeDefined();
    });
  });

  describe('confirmar pagamento', () => {
    it('o pagamento deve ser confirmado com sucesso', async () => {
      const result = await restApi.webhook('1abc', 1);

      // Verifica se o resultado obtido é igual ao esperado
      expect(result).toBeTruthy();
    }); // end it 'o pagamento deve ser realizado com sucesso'
  });

  describe('consultar estado do pagamento por ID do pedido', () => {
    it('a consulta deve ser realizada com sucesso', async () => {
      const result = await restApi.buscarPorPedidoId(buscarEstadoPagamentoPedidoRequest);
      expect(result.estadoPagamento).toEqual(EstadoPagamento.CONFIRMADO);
      expect(service.buscarEstadoPagamentoPedido).toHaveBeenCalledTimes(1);
    });

    it('a consulta nao encontra nenhum pagamento para o pedido', async () => {
      jest.spyOn(service, 'buscarEstadoPagamentoPedido').mockRejectedValue(new NaoEncontradoApplicationException());

      await expect(restApi.buscarPorPedidoId(buscarEstadoPagamentoPedidoRequest)).rejects.toThrowError(
        NaoEncontradoApplicationException,
      );
    });
  });

  describe('solicitar pagamento do pedido', () => {
    it('a consulta deve ser realizada com sucesso', async () => {
      const result = await restApi.solicitarPagamentoDePedido(solicitacaoPagamentoRequest);

      expect(service.solicitarPagamentoPedido).toHaveBeenCalledTimes(1);
      expect(result).toEqual(solicitacaoPagamentoResponse);
    });
  });

  describe('buscarPagamentoPorPedidoId', () => {
    it('should return PagamentoResponseDto and QR code for a valid pedidoId', async () => {
      const pedidoId = 1;
      const result = await restApi.buscarPagamentoPorPedidoId(pedidoId);

      expect(result.pagamento).toEqual(buscarPagamentoPedidoResponse.pagamento);
      expect(result.qrCode).toEqual(buscarPagamentoPedidoResponse.qrCode);
      expect(service.buscarPagamentoPedido).toHaveBeenCalledWith(pedidoId);
    });

    it('should throw an error for an invalid pedidoId', async () => {
      jest.spyOn(service, 'buscarPagamentoPedido').mockRejectedValueOnce(new Error('Pedido not found'));
      const pedidoId = 2;
      await expect(restApi.buscarPagamentoPorPedidoId(pedidoId)).rejects.toThrowError('Pedido not found');
      expect(service.buscarPagamentoPedido).toHaveBeenCalledWith(pedidoId);
    });
  });
});
