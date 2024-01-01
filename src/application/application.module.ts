import { Module } from '@nestjs/common';

import { PagamentoService } from './pagamento/service/pagamento.service';
import { PagamentoProviders } from 'src/application/pagamento/providers/pagamento.providers';
import { PagamentoConstants } from 'src/shared/constants';
import { HttpModule } from '@nestjs/axios';
import { IntegrationProviders } from '../integration/providers/integration.providers';
import { PedidoIntegration } from '../integration/pedido/pedido.integration';

@Module({
   imports: [HttpModule],
   providers: [ ...PagamentoProviders, PedidoIntegration],
   // providers: [...IntegrationProviders, ...PagamentoProviders],
   exports: [{ provide: PagamentoConstants.ISERVICE, useClass: PagamentoService }],
})
export class ApplicationModule {}
