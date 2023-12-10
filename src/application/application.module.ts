import { Module } from '@nestjs/common';

import { PagamentoService } from './pagamento/service/pagamento.service';
import { PagamentoProviders } from 'src/application/pagamento/providers/pagamento.providers';
import { PagamentoConstants } from 'src/shared/constants';

@Module({
   providers: [...PagamentoProviders],
   exports: [{ provide: PagamentoConstants.ISERVICE, useClass: PagamentoService }],
})
export class ApplicationModule {}
