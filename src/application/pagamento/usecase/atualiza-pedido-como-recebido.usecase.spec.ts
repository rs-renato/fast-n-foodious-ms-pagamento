import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { AtualizaPedidoComoRecebidoUseCase } from './atualiza-pedido-como-recebido.usecase';
import { PedidoIntegration } from 'src/integration/pedido/pedido.integration';
import { PedidoDto } from 'src/enterprise/pedido/pedido-dto';
import { EstadoPedido } from 'src/enterprise/pedido/estado-pedido';
import { IntegrationProviders } from 'src/integration/providers/integration.providers';
import { HttpModule } from '@nestjs/axios';
import { PagamentoProviders } from 'src/application/pagamento/providers/pagamento.providers';
import { PersistenceInMemoryProviders } from 'src/infrastructure/persistence/providers/persistence-in-memory.providers';
import { PagamentoConstants } from 'src/shared/constants';

describe('AtualizaPedidoComoRecebidoUseCase', () => {
  let useCase: AtualizaPedidoComoRecebidoUseCase;
  let pedidoIntegration: PedidoIntegration;

  const pedidoDto: PedidoDto = {
    clienteId: 1,
    dataInicio: '2024-01-05',
    estadoPedido: 0,
    ativo: true,
    id: 1,
    total: 10,
  };

  const pedidoDtoComoRecebido: PedidoDto = {
    clienteId: 1,
    dataInicio: '2024-01-05',
    estadoPedido: 1,
    ativo: true,
    id: 1,
    total: 10,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, ConfigModule],
      providers: [...IntegrationProviders, ...PagamentoProviders, ...PersistenceInMemoryProviders],
    }).compile();

    // Desabilita a saída de log
    module.useLogger(false);

    useCase = module.get<AtualizaPedidoComoRecebidoUseCase>(PagamentoConstants.ATUALIZA_PEDIDO_COMO_RECEBIDO_USECASE);
    pedidoIntegration = module.get<PedidoIntegration>(PedidoIntegration);
  });

  describe('atualizarPedidoComoRecebido', () => {
    it('O pedidoDto enviado para integração com pedido tem que estar com estado "RECEBIDO"', async () => {
      const editarPedidoSpy = jest.spyOn(pedidoIntegration, 'editarPedido').mockResolvedValue(undefined);

      await useCase.atualizarPedidoComoRecebido(pedidoDto);

      expect(pedidoDto.estadoPedido).toEqual(EstadoPedido.RECEBIDO);
      expect(editarPedidoSpy).toHaveBeenCalledWith(pedidoDtoComoRecebido);
    });

    it('deve lançar erro se pedidoIntegration.editarPedido falhar', async () => {
      const error = new Error('Erro');
      jest.spyOn(pedidoIntegration, 'editarPedido').mockRejectedValue(error);

      await expect(useCase.atualizarPedidoComoRecebido(pedidoDto)).rejects.toThrowError(error);
    });
  });
});
