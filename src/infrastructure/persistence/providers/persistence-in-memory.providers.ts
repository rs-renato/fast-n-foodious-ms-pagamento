import { Provider } from '@nestjs/common';

import { PagamentoConstants } from 'src/shared/constants';
import { PagamentoMemoryRepository } from 'src/infrastructure/persistence/pagamento/repository/pagamento-memory.repository';

export const PersistenceInMemoryProviders: Provider[] = [
  { provide: PagamentoConstants.IREPOSITORY, useClass: PagamentoMemoryRepository },
];
