import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePagamentoDto {
  @IsNumber()
  @IsNotEmpty()
  readonly id: number;

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
  readonly dataHoraPagamento: Date;
}
