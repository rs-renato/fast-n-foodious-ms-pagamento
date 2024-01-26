import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({collection: 'pagamentos'})
export class PagamentoMongoDbEntity {
  @Prop()
  id?: number;

  @Prop({ required: true })
  pedidoId: number;

  @Prop({ required: true })
  transacaoId: string;

  @Prop({ required: true })
  estadoPagamento: number;

  @Prop({ required: true })
  total: number;

  @Prop()
  dataHoraPagamento: Date;
}

export const PagamentoSchema = SchemaFactory.createForClass(PagamentoMongoDbEntity);
