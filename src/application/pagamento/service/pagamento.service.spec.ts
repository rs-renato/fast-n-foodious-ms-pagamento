import { Test, TestingModule } from '@nestjs/testing';
import { PagamentoProviders } from 'src/application/pagamento/providers/pagamento.providers';
import { IPagamentoService } from 'src/application/pagamento/service/pagamento.service.interface';
import { ServiceException } from 'src/enterprise/exception/service.exception';
import { EstadoPagamento } from 'src/enterprise/pagamento/enum/estado-pagamento.enum';
import { Pagamento } from 'src/enterprise/pagamento/model/pagamento.model';
import { IRepository } from 'src/enterprise/repository/repository';
import { RepositoryException } from 'src/infrastructure/exception/repository.exception';
import { PersistenceInMemoryProviders } from 'src/infrastructure/persistence/providers/persistence-in-memory.providers';
import { PagamentoConstants } from 'src/shared/constants';
import { HttpModule } from '@nestjs/axios';
import { IntegrationProviders } from 'src/integration/providers/integration.providers';
import { PedidoIntegration } from 'src/integration/pedido/pedido.integration';
import { PedidoDto } from 'src/enterprise/pedido/pedido-dto';

describe('PagamentoService', () => {
  let service: IPagamentoService;
  let pagamentoRepository: IRepository<Pagamento>;
  let pedidoIntegration: PedidoIntegration;

  const pagamento: Pagamento = {
    dataHoraPagamento: new Date(),
    estadoPagamento: EstadoPagamento.CONFIRMADO,
    pedidoId: 1,
    total: 10,
    transacaoId: '1',
    id: 1,
  };

  const pedidoDTO: PedidoDto = {
    clienteId: 1,
    dataInicio: '2024-01-05',
    estadoPedido: 0,
    ativo: true,
    id: 1,
    total: 10,
    itensPedido: [
      {
        pedidoId: 1,
        produtoId: 1,
        quantidade: 1,
        produto: {
          preco: 10,
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

  const pagamentos: Pagamento[] = [
    pagamento,
    {
      dataHoraPagamento: new Date(),
      estadoPagamento: EstadoPagamento.PENDENTE,
      pedidoId: 2,
      total: 20,
      transacaoId: '2',
      id: 2,
    },
  ];

  const pagamentoSolicitado: Pagamento = {
    dataHoraPagamento: new Date(),
    estadoPagamento: EstadoPagamento.PENDENTE,
    pedidoId: 1,
    total: 10,
    transacaoId: '1',
    id: 1,
  };

  beforeEach(async () => {
    // Configuração do módulo de teste
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        ...IntegrationProviders,
        ...PagamentoProviders,
        ...PersistenceInMemoryProviders,
        // Mock do serviço IRepository<Pagamento>
        {
          provide: PagamentoConstants.IREPOSITORY,
          useValue: {
            findBy: jest.fn(() => {
              // retorna vazio, simulando que não encontrou registros pelos atributos passados por parâmetro
              return Promise.resolve(pagamentos);
            }),
            save: jest.fn(() => {
              // retorna o pagamentoSolicitado
              return Promise.resolve(pagamentoSolicitado);
            }),
          },
        },
      ],
    }).compile();

    // Desabilita a saída de log
    module.useLogger(false);

    // Obtém a instância do repositório, validators e serviço a partir do módulo de teste
    pagamentoRepository = module.get<IRepository<Pagamento>>(PagamentoConstants.IREPOSITORY);
    pedidoIntegration = module.get<PedidoIntegration>(PedidoIntegration);
    service = module.get<IPagamentoService>(PagamentoConstants.ISERVICE);

    jest.spyOn(pedidoIntegration, 'getPedidoById').mockResolvedValue(pedidoDTO);
  });

  describe('injeção de dependências', () => {
    it('deve existir instância de repositório definida', async () => {
      expect(pagamentoRepository).toBeDefined();
      expect(service).toBeDefined();
    });
  });

  describe('buscarEstadoPagamentoPedido', () => {
    it('deve retornar estado do pagamento corretamente', async () => {
      await service.buscarEstadoPagamentoPedido(1).then((pagamento) => {
        expect(pagamento.estadoPagamento).toEqual(EstadoPagamento.CONFIRMADO);
      });
    });

    it('não deve encontrar pedido por id quando houver um erro de banco ', async () => {
      const error = new RepositoryException('Erro genérico de banco de dados');
      jest.spyOn(pagamentoRepository, 'findBy').mockRejectedValue(error);

      await expect(service.buscarEstadoPagamentoPedido(1)).rejects.toThrowError(ServiceException);
    });
  });

  describe('solicitarPagamentoPedido', () => {
    it('deve solicitar pagamento corretamente', async () => {
      const pedidoId = 1;
      const totalPedido = 10;
      await service.solicitarPagamentoPedido(pedidoId, totalPedido).then((pagamento) => {
        expect(pagamento.pedidoId).toEqual(pedidoId);
      });
    });
    it('não deve fazer solicitação de pagamento quando houver erro de banco ', async () => {
      const error = new RepositoryException('Erro genérico de banco de dados');
      jest.spyOn(pagamentoRepository, 'save').mockRejectedValue(error);
      const pedidoId = 1;
      const totalPedido = 10;
      await expect(service.solicitarPagamentoPedido(pedidoId, totalPedido)).rejects.toThrowError(ServiceException);
    });
  });
});
