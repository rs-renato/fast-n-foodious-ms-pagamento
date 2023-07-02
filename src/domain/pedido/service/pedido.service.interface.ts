import { IService } from 'src/domain/service/service';
import { Pedido } from '../model/pedido.model';
import { EstadoPedido } from '../enums/pedido';

export interface IPedidoService extends IService<Pedido> {
   findByIdEstadoDoPedido(pedidoId: number): Promise<{ estadoPedido: EstadoPedido }>;
   findAllByEstadoDoPedido(estado: EstadoPedido): Promise<Pedido[]>;
}