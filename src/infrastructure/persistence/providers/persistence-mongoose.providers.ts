import { Provider } from '@nestjs/common';
import { PagamentoMongoDbRepository } from 'src/infrastructure/persistence/pagamento/repository/pagamento-mongoose.repository';

import { PagamentoConstants } from 'src/shared/constants';

export const PersistenceMongooseProviders: Provider[] = [
  { provide: PagamentoConstants.IREPOSITORY, useClass: PagamentoMongoDbRepository },
];
