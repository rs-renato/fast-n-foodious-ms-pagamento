import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Pagamento } from 'src/enterprise/pagamento/model/pagamento.model';

export class SolicitacaoPagamentoResponse {
  @ApiProperty({ required: true, nullable: false, description: 'Informações do pagamento solicitado' })
  @IsNotEmpty({ message: 'Pagamento solicitado não pode ser vazio' })
  public pagamento: Pagamento;

  constructor(pagamento: Pagamento) {
    this.pagamento = pagamento;
  }
}
