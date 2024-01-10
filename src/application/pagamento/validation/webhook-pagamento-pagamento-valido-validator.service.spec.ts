import { Test, TestingModule } from '@nestjs/testing';
import { EstadoPagamento } from 'src/enterprise/pagamento/enum/estado-pagamento.enum';
import { Pagamento } from 'src/enterprise/pagamento/model/pagamento.model';
import { IRepository } from 'src/enterprise/repository/repository';
import { ServiceException } from 'src/enterprise/exception/service.exception';
import { ValidationException } from 'src/enterprise/exception/validation.exception';
import { PagamentoConstants } from 'src/shared/constants';
import { WebhookPagamentoPagamentoValidoValidator } from 'src/application/pagamento/validation/webhook-pagamento-pagamento-valido-validator.service';

describe('WebhookPagamentoPagamentoValidoValidator', () => {
  let validator: WebhookPagamentoPagamentoValidoValidator;
  let repository: IRepository<Pagamento>;

  const mockedPagamento: Pagamento = {
    pedidoId: 1,
    transacaoId: '123',
    estadoPagamento: EstadoPagamento.PENDENTE,
    total: 100,
    dataHoraPagamento: new Date(),
    id: 123,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookPagamentoPagamentoValidoValidator,
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

    validator = module.get<WebhookPagamentoPagamentoValidoValidator>(WebhookPagamentoPagamentoValidoValidator);
    repository = module.get<IRepository<Pagamento>>(PagamentoConstants.IREPOSITORY);
  });

  describe('validate', () => {
    it('should validate payment successfully if payment exists and not confirmed', async () => {
      jest.spyOn(repository, 'findBy').mockResolvedValueOnce([mockedPagamento]);

      const result = await validator.validate(mockedPagamento);

      expect(result).toBe(true);
    });

    it('should throw a ValidationException if no associated payment is found', async () => {
      jest.spyOn(repository, 'findBy').mockResolvedValueOnce([]);

      await expect(validator.validate(mockedPagamento)).rejects.toThrowError(ServiceException);
    });

    it('should throw a ValidationException if payment status is already confirmed', async () => {
      repository.findBy = jest.fn().mockImplementation(() => {
        return Promise.resolve([{ ...mockedPagamento, estadoPagamento: EstadoPagamento.CONFIRMADO }]);
      });

      await expect(validator.validate(mockedPagamento)).rejects.toThrowError(ValidationException);
    });

    it('should handle errors when fetching payment', async () => {
      jest.spyOn(repository, 'findBy').mockRejectedValueOnce(new Error('Failed to fetch payment'));

      await expect(validator.validate(mockedPagamento)).rejects.toThrowError(ServiceException);
    });

    it('should handle null or undefined payment', async () => {
      repository.findBy = jest.fn().mockImplementation(() => {
        return Promise.resolve([undefined]);
      });

      await expect(validator.validate(mockedPagamento)).rejects.toThrowError(ServiceException);
    });

    it('should handle a payment with undefined transaction ID', async () => {
      repository.findBy = jest.fn().mockImplementation((param) => {
        return Promise.resolve(param.hasOwnProperty('transacaoId') ? [mockedPagamento] : []);
      });
      const pagamento: Pagamento = { ...mockedPagamento, transacaoId: undefined };
      await expect(validator.validate(pagamento)).rejects.toThrowError(ValidationException);
    });
  });
});
