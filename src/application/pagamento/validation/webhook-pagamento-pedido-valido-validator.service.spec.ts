import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EstadoPedido } from 'src/enterprise/pedido/estado-pedido';
import { WebhookPagamentoPedidoValidoValidator } from 'src/application/pagamento/validation/webhook-pagamento-pedido-valido-validator.service';
import { EstadoPagamento } from 'src/enterprise/pagamento/enum/estado-pagamento.enum';
import { Pagamento } from 'src/enterprise/pagamento/model/pagamento.model';
import { IRepository } from 'src/enterprise/repository/repository';
import { PagamentoConstants } from 'src/shared/constants';
import { ServiceException } from 'src/enterprise/exception/service.exception';
import { ValidationException } from 'src/enterprise/exception/validation.exception';

describe('WebhookPagamentoPedidoValidoValidator', () => {
   let validator: WebhookPagamentoPedidoValidoValidator;
   let repository: IRepository<Pagamento>;
   let buscaPedidoIdUseCaseMock: {
      buscarPedidoPorId: jest.Mock;
   };

   const mockedPagamento: Pagamento = {
      pedidoId: 1,
      transacaoId: '123',
      estadoPagamento: EstadoPagamento.PENDENTE,
      total: 100,
      dataHoraPagamento: new Date(),
      id: 123,
   };

   const mockedPedido = {
      id: 1,
      estadoPedido: EstadoPedido.PAGAMENTO_PENDENTE,
   };

   beforeEach(async () => {
      buscaPedidoIdUseCaseMock = {
         buscarPedidoPorId: jest.fn(),
      };

      const module: TestingModule = await Test.createTestingModule({
         providers: [
            WebhookPagamentoPedidoValidoValidator,
            {
               provide: PagamentoConstants.IREPOSITORY,
               useValue: {
                  findBy: jest.fn(() => {
                     return Promise.resolve([mockedPagamento]);
                  }),
               },
            },
            {
               provide: PagamentoConstants.BUSCA_PEDIDO_ID_USECASE,
               useValue: buscaPedidoIdUseCaseMock,
            },
         ],
      }).compile();

      validator = module.get<WebhookPagamentoPedidoValidoValidator>(WebhookPagamentoPedidoValidoValidator);
      repository = module.get<IRepository<Pagamento>>(PagamentoConstants.IREPOSITORY);
   });

   describe('validate', () => {
      it('should validate payment successfully if pedido is pending', async () => {
         buscaPedidoIdUseCaseMock.buscarPedidoPorId.mockResolvedValueOnce(mockedPedido);

         const result = await validator.validate(mockedPagamento);

         expect(result).toBe(true);
      });

      it('should throw ValidationException if pedido is not pending', async () => {
         const pedidoPaid = { ...mockedPedido, estadoPedido: EstadoPedido.FINALIZADO };
         buscaPedidoIdUseCaseMock.buscarPedidoPorId.mockResolvedValueOnce(pedidoPaid);

         await expect(validator.validate(mockedPagamento)).rejects.toThrowError('O pedido já foi pago');
      });

      it('should throw ValidationException if pedido is not found', async () => {
         buscaPedidoIdUseCaseMock.buscarPedidoPorId.mockRejectedValueOnce(new NotFoundException());

         await expect(validator.validate(mockedPagamento)).rejects.toThrowError('Código de pedido inexistente');
      });

      it('should handle error from BuscaPedidoIdUseCase', async () => {
         buscaPedidoIdUseCaseMock.buscarPedidoPorId.mockRejectedValueOnce(new Error('Internal Server Error'));

         await expect(validator.validate(mockedPagamento)).rejects.toThrowError('Ocorreu um erro ao realizar a integração');
      });

      it('should handle null or undefined payment', async () => {
         repository.findBy = jest.fn().mockImplementation(() => {
            return Promise.resolve([undefined]);
         });

         await expect(validator.validate(mockedPagamento)).rejects.toThrowError(ServiceException);
      });

      it('should handle a payment with undefined transaction ID', async () => {
         // repository.findBy = jest.fn().mockImplementation((param) => {
         //    return Promise.resolve(param.hasOwnProperty('pedidoId') ? [mockedPagamento] : []);
         // });

         buscaPedidoIdUseCaseMock.buscarPedidoPorId.mockResolvedValueOnce({ ...mockedPedido, estadoPedido: EstadoPedido.FINALIZADO });
         const pagamento: Pagamento = { ...mockedPagamento, transacaoId: undefined };
         await expect(validator.validate(pagamento)).rejects.toThrowError(ValidationException);
      });
   });
});
