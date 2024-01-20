import { EstadoPagamento } from 'src/enterprise/pagamento/enum/estado-pagamento.enum';

export class PagamentoResponseDto {
   constructor(
      public pedidoId: number,
      public transacaoId: string,
      public estadoPagamento: EstadoPagamento,
      public total: number,
      public dataHoraPagamento: Date,
      public id: number | string,
   ) {
   }
}