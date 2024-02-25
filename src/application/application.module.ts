import { Module } from '@nestjs/common';

import { PagamentoService } from './pagamento/service/pagamento.service';
import { PagamentoProviders } from 'src/application/pagamento/providers/pagamento.providers';
import { PagamentoConstants } from 'src/shared/constants';
import { HttpModule } from '@nestjs/axios';
import { IntegrationProviders } from 'src/integration/providers/integration.providers';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [...IntegrationProviders, ...PagamentoProviders],
  exports: [{ provide: PagamentoConstants.ISERVICE, useClass: PagamentoService }],
})
export class ApplicationModule {}
