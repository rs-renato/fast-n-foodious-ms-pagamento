import { EstadoPagamento } from 'src/enterprise/pagamento/enum/estado-pagamento.enum';
import { Pagamento } from 'src/enterprise/pagamento/model/pagamento.model';
import { IService } from 'src/enterprise/service/service';

export interface IPagamentoService extends IService<Pagamento> {
  buscarEstadoPagamentoPedido(pedidoId: number): Promise<EstadoPagamento>;
  buscarPagamentoPedido(pedidoId: number): Promise<[Pagamento, string]>,
  solicitarPagamentoPedido(pedidoId: number, totalPedido: number): Promise<[Pagamento, string]>;
  webhookPagamentoPedido(transacaoId: string, estadoPagamento: number): Promise<boolean>;
}
