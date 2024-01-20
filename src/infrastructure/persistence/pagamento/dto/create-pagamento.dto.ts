import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';

export class CreatePagamentoDto {

  @IsNumber()
  @IsNotEmpty()
  readonly pedidoId: number;

  @IsString()
  @IsNotEmpty()
  readonly transacaoId: string;

  @IsNumber()
  @IsNotEmpty()
  readonly estadoPagamento: number;

  @IsNumber()
  @IsNotEmpty()
  readonly total: number;

  @IsDate()
  @IsOptional()
  readonly dataHoraPagamento?: Date;
}
