import { Provider } from '@nestjs/common';

import { PagamentoConstants } from 'src/shared/constants';

import { PagamentoTypeormRepository } from 'src/infrastructure/persistence/pagamento/repository/pagamento-typeorm.repository';

export const PersistenceTypeOrmProviders: Provider[] = [
  { provide: PagamentoConstants.IREPOSITORY, useClass: PagamentoTypeormRepository },
];
