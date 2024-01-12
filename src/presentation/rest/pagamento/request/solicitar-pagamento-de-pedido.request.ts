import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class SolicitacaoPagamentoRequest {
   @ApiProperty({ required: true, nullable: false, description: 'ID do pedido' })
   @IsNotEmpty({ message: 'ID do pedido não pode ser vazio' })
   public pedidoId: number;

   @ApiProperty({ required: true, nullable: false, description: 'Total do pedido' })
   @IsNotEmpty({ message: 'Total do pedido não pode ser vazio' })
   public totalPedido: number;
}
