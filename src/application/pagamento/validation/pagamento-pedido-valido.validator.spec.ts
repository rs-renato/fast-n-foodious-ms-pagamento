import { HttpModule } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';

import { PagamentoConstants } from 'src/shared/constants';
import { PedidoDto } from 'src/enterprise/pedido/pedido-dto';
import { Pagamento } from 'src/enterprise/pagamento/model/pagamento.model';
import { PedidoIntegration } from 'src/integration/pedido/pedido.integration';
import { EstadoPagamento } from 'src/enterprise/pagamento/enum/estado-pagamento.enum';
import { IntegrationProviders } from 'src/integration/providers/integration.providers';
import { PagamentoPedidoValidoValidator } from 'src/application/pagamento/validation/pagamento-pedido-valido.validator';
import { NaoEncontradoApplicationException } from 'src/application/exception/nao-encontrado.exception';

describe('PagamentoPedidoValidoValidator', () => {
  let validator: PagamentoPedidoValidoValidator;
  let pedidoIntegration: PedidoIntegration;

  const mockedPagamento: Pagamento = {
    pedidoId: 1,
    transacaoId: '123',
    estadoPagamento: EstadoPagamento.PENDENTE,
    total: 100,
    dataHoraPagamento: new Date(),
    id: 123,
  };

  const mockedPedidoDTO: PedidoDto = {
    clienteId: 1,
    dataInicio: '2024-01-05',
    estadoPedido: 0,
    ativo: true,
    id: 1,
    total: 100,
    itensPedido: [
      {
        pedidoId: 1,
        produtoId: 1,
        quantidade: 1,
        produto: {
          preco: 100,
          nome: 'Produto 1',
          idCategoriaProduto: 1,
          ativo: true,
          descricao: 'Produto 1',
          id: 1,
          imagemBase64: '',
        },
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        ...IntegrationProviders,
        PagamentoPedidoValidoValidator,
        {
          provide: PagamentoConstants.IREPOSITORY,
          useValue: {
            findBy: jest.fn(() => {
              return Promise.resolve([mockedPagamento]);
            }),
          },
        },
      ],
    }).compile();

    validator = module.get<PagamentoPedidoValidoValidator>(PagamentoPedidoValidoValidator);
    pedidoIntegration = module.get<PedidoIntegration>(PedidoIntegration);

    jest.spyOn(pedidoIntegration, 'getPedidoById').mockResolvedValue(mockedPedidoDTO);
  });

  describe('injeção de dependências', () => {
    it('deve existir instância de pedidoIntegration definida', async () => {
      expect(pedidoIntegration).toBeDefined();
    });
  });

  describe('validate', () => {
    it('deve passar na validacao', async () => {
      const result = await validator.validate(mockedPagamento);
      expect(result).toBe(true);
    });

    it('nao deve passar na validacao com VALOR_TOTAL_DIVERGENTE_ERROR_MESSAGE', async () => {
      const itensPedidoDivergente = {
        ...mockedPedidoDTO.itensPedido[0],
        produto: {
          ...mockedPedidoDTO.itensPedido[0].produto,
          preco: 1,
        },
      };
      jest
        .spyOn(pedidoIntegration, 'getPedidoById')
        .mockResolvedValueOnce({ ...mockedPedidoDTO, itensPedido: [itensPedidoDivergente] });
      await expect(validator.validate(mockedPagamento)).rejects.toThrowError(
        PagamentoPedidoValidoValidator.VALOR_TOTAL_DIVERGENTE_ERROR_MESSAGE,
      );
    });

    it('nao deve passar na validacao com MS_PEDIDO_ERROR_MESSAGE', async () => {
      jest.spyOn(pedidoIntegration, 'getPedidoById').mockRejectedValueOnce(new Error('Failed to connect MS Pedido'));

      await expect(validator.validate(mockedPagamento)).rejects.toThrowError(
        PagamentoPedidoValidoValidator.MS_PEDIDO_ERROR_MESSAGE,
      );
    });

    it('nao deve passar na validacao com PEDIDO_JA_PAGO_ERROR_MESSAGE', async () => {
      jest.spyOn(pedidoIntegration, 'getPedidoById').mockResolvedValueOnce({ ...mockedPedidoDTO, estadoPedido: 1 });

      await expect(validator.validate(mockedPagamento)).rejects.toThrowError(
        PagamentoPedidoValidoValidator.PEDIDO_JA_PAGO_ERROR_MESSAGE,
      );
    });

    it('nao deve passar na validacao com PEDIDO_INEXISTENTE_ERROR_MESSAGE', async () => {
      jest.spyOn(pedidoIntegration, 'getPedidoById').mockRejectedValueOnce(new NaoEncontradoApplicationException());

      await expect(validator.validate(mockedPagamento)).rejects.toThrowError(
        PagamentoPedidoValidoValidator.PEDIDO_INEXISTENTE_ERROR_MESSAGE,
      );
    });
  });
});
