import { Module } from '@nestjs/common';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { DocumentdbConfig } from 'src/infrastructure/persistence/documentdb/documentdb.config';
import { DatabaseDocConstants } from 'src/infrastructure/persistence/documentdb/documentdb.constants';
import {
  PagamentoMongoDbEntity,
  PagamentoSchema,
} from 'src/infrastructure/persistence/pagamento/schemas/pagamento.schema';
import { PersistenceMongooseProviders } from 'src/infrastructure/persistence/providers/persistence-mongoose.providers';

@Module({
  imports: [
    DatabaseDocConstants,
    MongooseModule.forFeature([{ name: PagamentoMongoDbEntity.name, schema: PagamentoSchema }]),

    MongooseModule.forRootAsync({
      imports: [DocumentdbConfig],
      useFactory: async (config: MongooseModuleOptions) => config,
      inject: [DatabaseDocConstants.DATABASE_DOC_CONFIG_NAME],
    }),
  ],
  providers: [...PersistenceMongooseProviders],
  exports: [...PersistenceMongooseProviders],
})
export class PagamentoMongooseModule {}
