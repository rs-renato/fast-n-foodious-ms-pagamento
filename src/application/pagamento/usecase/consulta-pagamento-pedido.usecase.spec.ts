import { Test, TestingModule } from '@nestjs/testing';
import { PagamentoProviders } from 'src/application/pagamento/providers/pagamento.providers';
import { ServiceException } from 'src/enterprise/exception/service.exception';
import { EstadoPagamento } from 'src/enterprise/pagamento/enum/estado-pagamento.enum';
import { Pagamento } from 'src/enterprise/pagamento/model/pagamento.model';
import { IRepository } from 'src/enterprise/repository/repository';
import { PersistenceInMemoryProviders } from 'src/infrastructure/persistence/providers/persistence-in-memory.providers';
import { PagamentoConstants } from 'src/shared/constants';
import { ConsultaPagamentoPedidoUseCase } from './consulta-pagamento-pedido.usecase';
import { IntegrationProviders } from 'src/integration/providers/integration.providers';
import { HttpModule } from '@nestjs/axios';
import { NaoEncontradoApplicationException } from 'src/application/exception/nao-encontrado.exception';

describe('ConsultaPagamentoPedidoUseCase', () => {
  let useCase: ConsultaPagamentoPedidoUseCase;
  let repository: IRepository<Pagamento>;

  const mockedPagamento: Pagamento = {
    dataHoraPagamento: new Date(),
    estadoPagamento: EstadoPagamento.CONFIRMADO,
    pedidoId: 1,
    total: 10,
    transacaoId: '1',
    id: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [...IntegrationProviders, ...PagamentoProviders, ...PersistenceInMemoryProviders],
    }).compile();

    // Desabilita a saída de log
    module.useLogger(false);

    useCase = module.get<ConsultaPagamentoPedidoUseCase>(PagamentoConstants.CONSULTA_PAGAMENTO_USECASE);
    repository = module.get<IRepository<Pagamento>>(PagamentoConstants.IREPOSITORY);
  });

  describe('buscarEstadoPedidoPorId', () => {
    it('deve buscar o estado de um pagamento por ID do pedido com sucesso', async () => {
      jest.spyOn(repository, 'findBy').mockResolvedValue([mockedPagamento]);

      const result = await useCase.buscaPagamentoPorIdPedido(1);

      expect(result.estadoPagamento).toEqual(mockedPagamento.estadoPagamento);
    });

    it('deve retornar NaoEncontradoApplicationException quando o pagamento não for encontrado', async () => {
      jest.spyOn(repository, 'findBy').mockResolvedValue([]);

      await expect(useCase.buscaPagamentoPorIdPedido(2)).rejects.toThrow(NaoEncontradoApplicationException);
    });

    it('deve lançar uma ServiceException em caso de erro no repositório', async () => {
      const error = new Error('Erro no repositório');
      jest.spyOn(repository, 'findBy').mockRejectedValue(error);

      await expect(useCase.buscaPagamentoPorIdPedido(3)).rejects.toThrowError(ServiceException);
    });
  });
});
