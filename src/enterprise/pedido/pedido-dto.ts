import { ItemPedido } from '../item-pedido/item-pedido';

export class PedidoDto {
  constructor(
    public clienteId: number,
    public dataInicio: string,
    public estadoPedido: number,
    public ativo: boolean,
    public id: number,
    public total: number,
    public itensPedido?: ItemPedido[],
  ) {}

  static fromJson(json: any): PedidoDto {
    return new PedidoDto(
      json.clienteId,
      json.dataInicio,
      json.estadoPedido,
      json.ativo,
      json.id,
      json.total,
      json.itensPedido,
    );
  }
}
