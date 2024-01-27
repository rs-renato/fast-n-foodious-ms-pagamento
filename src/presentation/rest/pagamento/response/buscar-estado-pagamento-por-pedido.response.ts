import { ApiProperty } from '@nestjs/swagger';
import { EstadoPagamento } from 'src/enterprise/pagamento/enum/estado-pagamento.enum';

export class BuscarEstadoPagamentoPedidoResponse {
  @ApiProperty({
    required: true,
    nullable: false,
    enum: EstadoPagamento,
    description: `${Object.values(EstadoPagamento)
      .filter((value) => typeof value === 'number')
      .map((value) => `${value}:${EstadoPagamento[value]}`)
      .join(', ')}`,
  })
  public estadoPagamento: EstadoPagamento;

  constructor(estadoPagamento: EstadoPagamento) {
    this.estadoPagamento = estadoPagamento;
  }
}
