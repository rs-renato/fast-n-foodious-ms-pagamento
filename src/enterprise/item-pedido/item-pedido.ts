import { ProdutoDto } from '../produto/produto';

export class ItemPedido {
  constructor(
    public pedidoId: number,
    public produtoId: number,
    public quantidade: number,
    public id?: number,
    public produto?: ProdutoDto,
  ) {}
}
