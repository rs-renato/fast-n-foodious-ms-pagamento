import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { AtualizaPedidoComoRecebidoUseCase } from './atualiza-pedido-como-recebido.usecase';
import { PedidoDto } from 'src/enterprise/pedido/pedido-dto';
import { IntegrationProviders } from 'src/integration/providers/integration.providers';
import { HttpModule } from '@nestjs/axios';
import { PagamentoProviders } from 'src/application/pagamento/providers/pagamento.providers';
import { PersistenceInMemoryProviders } from 'src/infrastructure/persistence/providers/persistence-in-memory.providers';
import { PagamentoConstants } from 'src/shared/constants';
import { EstadoPagamento } from 'src/enterprise/pagamento/enum/estado-pagamento.enum';
import { Pagamento } from 'src/enterprise/pagamento/model/pagamento.model';
import { SqsIntegration } from 'src/integration/sqs/sqs.integration';

describe('AtualizaPedidoComoRecebidoUseCase', () => {
  let useCase: AtualizaPedidoComoRecebidoUseCase;
  let sqsIntegration: SqsIntegration;

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

  const pagamento: Pagamento = {
    dataHoraPagamento: new Date(),
    estadoPagamento: EstadoPagamento.CONFIRMADO,
    pedidoId: 1,
    total: 10,
    transacaoId: '1',
    id: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, ConfigModule],
      providers: [...IntegrationProviders, ...PagamentoProviders, ...PersistenceInMemoryProviders],
    }).compile();

    // Desabilita a saída de log
    module.useLogger(false);

    useCase = module.get<AtualizaPedidoComoRecebidoUseCase>(PagamentoConstants.ATUALIZA_PEDIDO_COMO_RECEBIDO_USECASE);
    sqsIntegration = module.get<SqsIntegration>(SqsIntegration);
  });

  describe('atualizarPagamentoPedidoComoRecebido', () => {
    it('O pedidoDto enviado para integração com pedido tem que estar com estado "RECEBIDO"', async () => {
      const sqsIntegrationSpy = jest.spyOn(sqsIntegration, 'sendEstadoPagamentoPedido').mockResolvedValue(undefined);

      await useCase.atualizarPagamentoPedidoComoRecebido(pagamento);

      expect(sqsIntegrationSpy).toHaveBeenCalledWith(pagamento);
    });

    it('deve lançar erro se pedidoIntegration.editarPedido falhar', async () => {
      const error = new Error('Erro');
      jest.spyOn(sqsIntegration, 'sendEstadoPagamentoPedido').mockRejectedValue(error);

      await expect(useCase.atualizarPagamentoPedidoComoRecebido(pagamento)).rejects.toThrowError(error);
    });
  });
});
