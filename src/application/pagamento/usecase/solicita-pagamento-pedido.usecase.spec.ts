import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule } from '@nestjs/axios';

import { PagamentoConstants } from 'src/shared/constants';
import { PedidoDto } from 'src/enterprise/pedido/pedido-dto';
import { IRepository } from 'src/enterprise/repository/repository';
import { PagamentoValidator } from '../validation/pagamento.validator';
import { Pagamento } from 'src/enterprise/pagamento/model/pagamento.model';
import { ServiceException } from 'src/enterprise/exception/service.exception';
import { PedidoIntegration } from 'src/integration/pedido/pedido.integration';
import { EstadoPagamento } from 'src/enterprise/pagamento/enum/estado-pagamento.enum';
import { IntegrationProviders } from 'src/integration/providers/integration.providers';
import { PagamentoProviders } from 'src/application/pagamento/providers/pagamento.providers';
import { SolicitaPagamentoPedidoUseCase } from 'src/application/pagamento/usecase/solicita-pagamento-pedido.usecase';
import { PersistenceInMemoryProviders } from 'src/infrastructure/persistence/providers/persistence-in-memory.providers';

describe('SolicitaPagamentoPedidoUseCase', () => {
  let useCase: SolicitaPagamentoPedidoUseCase;
  let repository: IRepository<Pagamento>;
  let pedidoIntegration: PedidoIntegration;
  let validators: PagamentoValidator[];

  const pagamento: Pagamento = {
    dataHoraPagamento: new Date(),
    estadoPagamento: EstadoPagamento.PENDENTE,
    pedidoId: 1,
    total: 10,
    transacaoId: '123456-abcdef',
    id: 1,
  };

  const pedidoDTO: PedidoDto = {
    clienteId: 1,
    dataInicio: '2024-01-05',
    estadoPedido: 0,
    ativo: true,
    id: 1,
    total: 10,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [...IntegrationProviders, ...PagamentoProviders, ...PersistenceInMemoryProviders],
    }).compile();

    // Desabilita a saída de log
    module.useLogger(false);

    useCase = module.get<SolicitaPagamentoPedidoUseCase>(PagamentoConstants.SOLICITA_PAGAMENTO_PEDIDO_USECASE);
    repository = module.get<IRepository<Pagamento>>(PagamentoConstants.IREPOSITORY);
    pedidoIntegration = module.get<PedidoIntegration>(PedidoIntegration);
    validators = module.get<PagamentoValidator[]>(PagamentoConstants.PAGAMENTO_VALIDATOR);

    jest.spyOn(pedidoIntegration, 'getPedidoById').mockResolvedValue(pedidoDTO);
  });

  describe('SolicitaPagamentoPedidoUseCase', () => {
    it('deve existir instâncias definidas', async () => {
      expect(repository).toBeDefined();
      expect(pedidoIntegration).toBeDefined();
      expect(validators).toBeDefined();
    });

    it('deve realizar o pagamento do pedido e gerar o id de transação', async () => {
      jest.spyOn(repository, 'save').mockResolvedValue(pagamento);
      const pedidoId = 1;
      const totalPedido = 10;
      const pagamentoResponse = await useCase.solicitaPagamento(pedidoId, totalPedido);
      expect(pagamentoResponse.pedidoId).toEqual(pedidoId);
    });

    it('deve lançar uma ServiceException em caso de erro no repositório', async () => {
      const error = new Error('Erro no repositório');
      jest.spyOn(repository, 'save').mockRejectedValue(error);
      const pedidoId = 1;
      const totalPedido = 10;
      await expect(useCase.solicitaPagamento(pedidoId, totalPedido)).rejects.toThrowError(ServiceException);
    });

    it('deve executar os validators antes de solicitar o pagamento', async () => {
      const mockValidator: PagamentoValidator = {
        validate: jest.fn(),
      };
      validators.push(mockValidator);

      const pedidoId = 1;
      const totalPedido = 10;
      await useCase.solicitaPagamento(pedidoId, totalPedido);

      expect(mockValidator.validate).toHaveBeenCalledTimes(1);
    });
  });
});
