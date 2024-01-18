import { Provider } from '@nestjs/common';

import { PagamentoConstants } from 'src/shared/constants';

import { PagamentoTypeormRepository } from 'src/infrastructure/persistence/pagamento/repository/pagamento-typeorm.repository';
import {
  PagamentoMongoDbRepository
} from 'src/infrastructure/persistence/pagamento/repository/pagamento-mongoose.repository';

export const PersistenceMongooseProviders: Provider[] = [
  { provide: PagamentoConstants.IREPOSITORY, useClass: PagamentoMongoDbRepository },
];
