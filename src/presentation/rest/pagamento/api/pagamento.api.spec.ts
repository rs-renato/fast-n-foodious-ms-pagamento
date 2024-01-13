import { Test, TestingModule } from '@nestjs/testing';
import { IPagamentoService } from 'src/application/pagamento/service/pagamento.service.interface';
import { EstadoPagamento } from 'src/enterprise/pagamento/enum/estado-pagamento.enum';
import { PagamentoRestApi } from 'src/presentation/rest/pagamento/api/pagamento.api';
import { PagamentoConstants } from 'src/shared/constants';
import { BuscarEstadoPagamentoPedidoRequest } from 'src/presentation/rest/pagamento/request';
import { BuscarEstadoPagamentoPedidoResponse } from 'src/presentation/rest/pagamento/response';
import { SolicitacaoPagamentoRequest } from 'src/presentation/rest/pagamento/request/solicitar-pagamento-de-pedido.request';
import { SolicitacaoPagamentoResponse } from 'src/presentation/rest/pagamento/response/solicitar-pagamento-de-pedido.response';
import { Pagamento } from 'src/enterprise/pagamento/model/pagamento.model';
import { NotFoundException } from '@nestjs/common';

describe('PagamentoRestApi', () => {
  let restApi: PagamentoRestApi;
  let service: IPagamentoService;

  const buscarEstadoPagamentoPedidoRequest: BuscarEstadoPagamentoPedidoRequest = {
    pedidoId: 1,
  };

  const buscarEstadoPagamentoPedidoResponse: BuscarEstadoPagamentoPedidoResponse = {
    estadoPagamento: EstadoPagamento.CONFIRMADO,
  };

  const solicitacaoPagamentoRequest: SolicitacaoPagamentoRequest = {
    pedidoId: 1,
    totalPedido: 100,
  };

  const pagamentoSolicitado: Pagamento = {
    pedidoId: 1,
    transacaoId: '123',
    estadoPagamento: EstadoPagamento.PENDENTE,
    total: 100,
    dataHoraPagamento: new Date(),
    id: 123,
  };

  const solicitacaoPagamentoResponse: SolicitacaoPagamentoResponse = {
    pagamento: pagamentoSolicitado,
  };

  beforeEach(async () => {
    // Configuração do módulo de teste
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PagamentoRestApi],
      providers: [
        {
          provide: PagamentoConstants.ISERVICE,
          useValue: {
            buscarEstadoPagamentoPedido: jest.fn((pedidoId) =>
              pedidoId === 1
                ? Promise.resolve(buscarEstadoPagamentoPedidoResponse)
                : Promise.reject(new Error('error')),
            ),
            webhookPagamentoPedido: jest.fn(() => Promise.resolve(true)),
            solicitarPagamentoPedido: jest.fn((pedidoId, totalPedido) =>
              pedidoId === 1 && totalPedido === 100
                ? Promise.resolve(pagamentoSolicitado)
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

      expect(service.buscarEstadoPagamentoPedido).toHaveBeenCalledTimes(1);
      expect(result).toEqual(buscarEstadoPagamentoPedidoResponse);
    });

    it('a consulta nao encontra nenhum pagamento para o pedido', async () => {
      jest.spyOn(service, 'buscarEstadoPagamentoPedido').mockResolvedValue(undefined);

      await expect(restApi.buscarPorPedidoId(buscarEstadoPagamentoPedidoRequest)).rejects.toThrowError(
        NotFoundException,
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
});
