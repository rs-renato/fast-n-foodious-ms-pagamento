import { Types, Document } from 'mongoose';

export interface PagamentoDocument extends Document {
  readonly _id: Types.ObjectId;
  readonly id: number;
  readonly pedidoId: number;
  readonly transacaoId: string;
  readonly estadoPagamento: number;
  readonly total: number;
  readonly dataHoraPagamento: Date;
}
