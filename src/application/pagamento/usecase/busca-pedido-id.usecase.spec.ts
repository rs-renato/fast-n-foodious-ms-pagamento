import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { BuscaPedidoIdUseCase } from './busca-pedido-id.usecase';
import { PedidoIntegration } from 'src/integration/pedido/pedido.integration';
import { PedidoDto } from 'src/enterprise/pedido/pedido-dto';
import { IntegrationProviders } from 'src/integration/providers/integration.providers';
import { HttpModule } from '@nestjs/axios';
import { PagamentoProviders } from 'src/application/pagamento/providers/pagamento.providers';
import { PersistenceInMemoryProviders } from 'src/infrastructure/persistence/providers/persistence-in-memory.providers';
import { PagamentoConstants } from 'src/shared/constants';

describe('BuscaPedidoIdUseCase', () => {
  let useCase: BuscaPedidoIdUseCase;
  let pedidoIntegration: PedidoIntegration;

  const pedidoDto: PedidoDto = {
    clienteId: 1,
    dataInicio: '2024-01-05',
    estadoPedido: 0,
    ativo: true,
    id: 1,
    total: 10,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, ConfigModule],
      providers: [...IntegrationProviders, ...PagamentoProviders, ...PersistenceInMemoryProviders],
    }).compile();

    useCase = module.get<BuscaPedidoIdUseCase>(PagamentoConstants.BUSCA_PEDIDO_ID_USECASE);
    pedidoIntegration = module.get<PedidoIntegration>(PedidoIntegration);
  });

  describe('buscarPedidoPorId', () => {
    it('deve retornar corretamente um pedido buscado', async () => {
      jest.spyOn(pedidoIntegration, 'getPedidoById').mockResolvedValue(pedidoDto);

      const result = await useCase.buscarPedidoPorId(1);

      expect(result).toEqual(pedidoDto);
    });

    it('deve lançar erro se pedidoIntegration.getPedidoById falhar', async () => {
      const error = new Error('Erro');
      jest.spyOn(pedidoIntegration, 'getPedidoById').mockRejectedValue(error);

      await expect(useCase.buscarPedidoPorId(1)).rejects.toThrowError(error);
    });
  });
});
