import { Test, TestingModule } from '@nestjs/testing';
import { PagamentoProviders } from 'src/application/pagamento/providers/pagamento.providers';
import { SolicitaPagamentoPedidoUseCase } from 'src/application/pagamento/usecase/solicita-pagamento-pedido.usecase';
import { ServiceException } from 'src/enterprise/exception/service.exception';

import { EstadoPagamento } from 'src/enterprise/pagamento/enum/estado-pagamento.enum';
import { Pagamento } from 'src/enterprise/pagamento/model/pagamento.model';
import { IRepository } from 'src/enterprise/repository/repository';
import { PersistenceInMemoryProviders } from 'src/infrastructure/persistence/providers/persistence-in-memory.providers';
import { PagamentoConstants } from 'src/shared/constants';
import { HttpModule } from '@nestjs/axios';
import { IntegrationProviders } from 'src/integration/providers/integration.providers';

describe('SolicitaPagamentoPedidoUseCase', () => {
  let useCase: SolicitaPagamentoPedidoUseCase;
  let repository: IRepository<Pagamento>;

  const pagamento: Pagamento = {
    dataHoraPagamento: new Date(),
    estadoPagamento: EstadoPagamento.PENDENTE,
    pedidoId: 1,
    total: 10,
    transacaoId: '123456-abcdef',
    id: 1,
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
  });

  describe('SolicitaPagamentoPedidoUseCase', () => {
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
  });
});
