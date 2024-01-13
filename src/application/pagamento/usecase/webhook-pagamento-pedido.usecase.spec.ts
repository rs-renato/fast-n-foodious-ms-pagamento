import { Test, TestingModule } from '@nestjs/testing';
import { WebhookPagamentoPedidoUseCase } from './webhook-pagamento-pedido.usecase';
import { EstadoPagamento } from 'src/enterprise/pagamento/enum/estado-pagamento.enum';
import { Pagamento } from 'src/enterprise/pagamento/model/pagamento.model';
import { IRepository } from 'src/enterprise/repository/repository';
import { ServiceException } from 'src/enterprise/exception/service.exception';
import { ValidationException } from 'src/enterprise/exception/validation.exception';
import { BuscaPedidoIdUseCase } from './busca-pedido-id.usecase';
import { AtualizaPedidoComoRecebidoUseCase } from 'src/application/pagamento/usecase/atualiza-pedido-como-recebido.usecase';
import { PagamentoConstants } from 'src/shared/constants';
import { WebhookPagamentoValidator } from 'src/application/pagamento/validation/webhook-pagamento.validator';

describe('WebhookPagamentoPedidoUseCase', () => {
  let useCase: WebhookPagamentoPedidoUseCase;
  let repository: IRepository<Pagamento>;
  let buscaPedidoIdUseCase: BuscaPedidoIdUseCase;
  let atualizaPedidoComoRecebidoUseCase: AtualizaPedidoComoRecebidoUseCase;

  const mockedValidators: WebhookPagamentoValidator[] = []; // Adicione os validadores conforme necessário

  const mockedPagamento: Pagamento = {
    pedidoId: 1,
    transacaoId: '123',
    estadoPagamento: EstadoPagamento.CONFIRMADO,
    total: 100,
    dataHoraPagamento: new Date(),
    id: 123,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookPagamentoPedidoUseCase,
        {
          provide: PagamentoConstants.IREPOSITORY,
          useValue: {
            findBy: jest.fn(() => {
              return Promise.resolve([mockedPagamento]);
            }),
            edit: jest.fn(),
          },
        },
        {
          provide: PagamentoConstants.BUSCA_PEDIDO_ID_USECASE,
          useValue: {
            buscarPedidoPorId: jest.fn(),
          },
        },
        {
          provide: PagamentoConstants.ATUALIZA_PEDIDO_COMO_RECEBIDO_USECASE,
          useValue: {
            atualizarPedidoComoRecebido: jest.fn(),
          },
        },
        {
          provide: PagamentoConstants.WEBHOOK_PAGAMENTO_VALIDATOR,
          useValue: mockedValidators,
        },
      ],
    }).compile();

    useCase = module.get<WebhookPagamentoPedidoUseCase>(WebhookPagamentoPedidoUseCase);
    repository = module.get<IRepository<Pagamento>>(PagamentoConstants.IREPOSITORY);
    buscaPedidoIdUseCase = module.get<BuscaPedidoIdUseCase>(PagamentoConstants.BUSCA_PEDIDO_ID_USECASE);
    atualizaPedidoComoRecebidoUseCase = module.get<AtualizaPedidoComoRecebidoUseCase>(
      PagamentoConstants.ATUALIZA_PEDIDO_COMO_RECEBIDO_USECASE,
    );
  });

  describe('webhook', () => {
    it('should execute webhook successfully for a confirmed payment', async () => {
      jest.spyOn(repository, 'findBy').mockResolvedValueOnce([mockedPagamento]);
      jest.spyOn(atualizaPedidoComoRecebidoUseCase, 'atualizarPedidoComoRecebido').mockResolvedValueOnce(undefined);

      const result = await useCase.webhook('123', 1);

      expect(result).toBe(true);
      expect(repository.edit).toHaveBeenCalledWith(mockedPagamento);
    });

    it('should throw a ServiceException if no associated payment is found', async () => {
      jest.spyOn(repository, 'findBy').mockResolvedValueOnce([]);

      await expect(useCase.webhook('123', 1)).rejects.toThrowError(ServiceException);
      expect(repository.edit).not.toHaveBeenCalled();
    });

    it('should throw a Repository error', async () => {
      const error = new Error('Erro no repositório');
      jest.spyOn(repository, 'findBy').mockRejectedValue(error);

      await expect(useCase.webhook('123', 1)).rejects.toThrowError(ServiceException);
      expect(repository.edit).not.toHaveBeenCalled();
    });

    it('should throw a ValidationException for an invalid payment state', async () => {
      jest.spyOn(repository, 'findBy').mockResolvedValueOnce([mockedPagamento]);
      jest.spyOn(atualizaPedidoComoRecebidoUseCase, 'atualizarPedidoComoRecebido').mockResolvedValueOnce(undefined);
      mockedPagamento.estadoPagamento = EstadoPagamento.REJEITADO;

      await expect(useCase.webhook('123', 4)).rejects.toThrowError(ValidationException);
      expect(repository.edit).not.toHaveBeenCalled();
    });

    it('should update payment state and log when payment is confirmed', async () => {
      jest.spyOn(repository, 'findBy').mockResolvedValueOnce([mockedPagamento]);
      jest.spyOn(atualizaPedidoComoRecebidoUseCase, 'atualizarPedidoComoRecebido').mockResolvedValueOnce(undefined);

      await useCase.webhook('123', 1);

      expect(mockedPagamento.estadoPagamento).toEqual(EstadoPagamento.CONFIRMADO);
      expect(repository.edit).toHaveBeenCalledWith(mockedPagamento);
    });

    it('should update payment state and log when payment is NOT confirmed', async () => {
      const mockedPagamentoPendente = {
        ...mockedPagamento,
        estadoPagamento: EstadoPagamento.PENDENTE,
        dataHoraPagamento: null,
      };
      jest.spyOn(repository, 'findBy').mockResolvedValueOnce([mockedPagamentoPendente]);
      jest.spyOn(atualizaPedidoComoRecebidoUseCase, 'atualizarPedidoComoRecebido').mockResolvedValueOnce(undefined);

      await useCase.webhook('123', 0);

      expect(repository.edit).toHaveBeenCalledWith(mockedPagamentoPendente);
    });
  });
});

describe('WebhookPagamentoPedidoUseCase', () => {
  it('criando um teste vazio para poder comentar o resto do código', () => {
    expect(true).toBeTruthy();
  });
});
