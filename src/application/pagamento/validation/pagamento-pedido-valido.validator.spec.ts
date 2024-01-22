import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule } from '@nestjs/axios';

import { PagamentoConstants } from 'src/shared/constants';
import { IRepository } from 'src/enterprise/repository/repository';
import { Pagamento } from 'src/enterprise/pagamento/model/pagamento.model';
import { ServiceException } from 'src/enterprise/exception/service.exception';
import { PedidoIntegration } from 'src/integration/pedido/pedido.integration';
import { ValidationException } from 'src/enterprise/exception/validation.exception';
import { EstadoPagamento } from 'src/enterprise/pagamento/enum/estado-pagamento.enum';
import { IntegrationProviders } from 'src/integration/providers/integration.providers';
import { PagamentoPedidoValidoValidator } from 'src/application/pagamento/validation/pagamento-pedido-valido.validator';
import { PedidoDto } from 'src/enterprise/pedido/pedido-dto';
import { NotFoundException } from '@nestjs/common';

describe('PagamentoPedidoValidoValidator', () => {
  let validator: PagamentoPedidoValidoValidator;
  let pedidoIntegration: PedidoIntegration;
  let repository: IRepository<Pagamento>;

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
    repository = module.get<IRepository<Pagamento>>(PagamentoConstants.IREPOSITORY);

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
      jest.spyOn(pedidoIntegration, 'getPedidoById').mockResolvedValueOnce({ ...mockedPedidoDTO, total: 1 });
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
      jest.spyOn(pedidoIntegration, 'getPedidoById').mockRejectedValueOnce(new NotFoundException());

      await expect(validator.validate(mockedPagamento)).rejects.toThrowError(
        PagamentoPedidoValidoValidator.PEDIDO_INEXISTENTE_ERROR_MESSAGE,
      );
    });
    // it('should throw a ValidationException if no associated payment is found', async () => {
    //   jest.spyOn(repository, 'findBy').mockResolvedValueOnce([]);
    //   await expect(validator.validate(mockedPagamento)).rejects.toThrowError(ServiceException);
    // });
    // it('should throw a ValidationException if payment status is already confirmed', async () => {
    //   repository.findBy = jest.fn().mockImplementation(() => {
    //     return Promise.resolve([{ ...mockedPagamento, estadoPagamento: EstadoPagamento.CONFIRMADO }]);
    //   });
    //   await expect(validator.validate(mockedPagamento)).rejects.toThrowError(ValidationException);
    // });
    // it('should handle errors when fetching payment', async () => {
    //   jest.spyOn(repository, 'findBy').mockRejectedValueOnce(new Error('Failed to fetch payment'));
    //   await expect(validator.validate(mockedPagamento)).rejects.toThrowError(ServiceException);
    // });
    // it('should handle null or undefined payment', async () => {
    //   repository.findBy = jest.fn().mockImplementation(() => {
    //     return Promise.resolve([undefined]);
    //   });
    //   await expect(validator.validate(mockedPagamento)).rejects.toThrowError(ServiceException);
    // });
    // it('should handle a payment with undefined transaction ID', async () => {
    //   repository.findBy = jest.fn().mockImplementation((param) => {
    //     return Promise.resolve(param.hasOwnProperty('transacaoId') ? [mockedPagamento] : []);
    //   });
    //   const pagamento: Pagamento = { ...mockedPagamento, transacaoId: undefined };
    //   await expect(validator.validate(pagamento)).rejects.toThrowError(ValidationException);
    // });
  });
});
