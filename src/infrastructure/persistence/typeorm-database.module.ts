import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { MysqlConfig } from 'src/infrastructure/persistence/mysql/mysql.config';
import { DatabaseConstants } from 'src/infrastructure/persistence/mysql/mysql.constants';
import { PersistenceTypeOrmProviders } from 'src/infrastructure/persistence/providers/persistence-typeorm.providers';
import { PagamentoEntity } from './pagamento/entity/pagamento.entity';

@Module({
   imports: [
      DatabaseConstants,
      TypeOrmModule.forFeature([PagamentoEntity]),
      TypeOrmModule.forRootAsync({
         imports: [MysqlConfig],
         useFactory: async (config: TypeOrmModuleOptions) => config,
         inject: [DatabaseConstants.DATABASE_CONFIG_NAME],
      }),
   ],
   providers: [...PersistenceTypeOrmProviders],
   exports: [...PersistenceTypeOrmProviders],
})
export class TypeormDatabaseModule {}
