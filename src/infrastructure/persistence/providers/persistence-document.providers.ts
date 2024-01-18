import { Provider } from '@nestjs/common';

import { PagamentoConstants } from 'src/shared/constants';
import { PagamentoDocumentRepository } from 'src/infrastructure/persistence/pagamento/repository/pagamento-document.repository';

export const PersistenceDocumentProviders: Provider[] = [
  { provide: PagamentoConstants.IREPOSITORY, useClass: PagamentoDocumentRepository },
];
