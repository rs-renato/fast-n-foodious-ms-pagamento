export class PedidoDto {
   constructor(
      public clienteId: number,
      public dataInicio: string,
      public estadoPedido: number,
      public ativo: boolean,
      public id: number,
      public total: number,
   ) {}


   static fromJson(json: any): PedidoDto {
      return new PedidoDto(json.clienteId, json.dataInicio, json.estadoPedido, json.ativo, json.id, json.total);
   }

}

export enum EstadoPedido {
   PAGAMENTO_PENDENTE = 0,
   RECEBIDO = 1,
   EM_PREPARACAO = 2,
   PRONTO = 3,
   FINALIZADO = 4,
}