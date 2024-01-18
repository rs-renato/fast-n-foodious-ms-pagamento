import { DynamicModule, Logger, Module } from '@nestjs/common';
import { DocumentDatabaseModule } from 'src/infrastructure/persistence/document-database.module';
import { MemoryDatabaseModule } from 'src/infrastructure/persistence/memory-database.module';
import { TypeormDatabaseModule } from 'src/infrastructure/persistence/typeorm-database.module';

@Module({})
export class DatabaseModule {

  static logger: Logger = new Logger(DatabaseModule.name);

  static forFeature(): DynamicModule {
    if (process.env.NODE_ENV === 'local-mock-repository') {
      this.logger.log('Carregando repositório em memória')
      return {
        module: MemoryDatabaseModule,
        exports: [MemoryDatabaseModule],
      };
    } else {

      if (process.env.DATABASE_ENGINE === 'sql'){
        this.logger.log('Carregando repositório SQL')
        return {
          module: TypeormDatabaseModule,
          exports: [TypeormDatabaseModule],
        };
      }else if (process.env.DATABASE_ENGINE === 'nosql'){
        this.logger.log('Carregando repositório NoSQL')
        return {
          module: DocumentDatabaseModule,
          exports: [DocumentDatabaseModule],
        };
      }
    }
  }
}
