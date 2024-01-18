import { Module } from '@nestjs/common';
import { PersistenceDocumentProviders } from 'src/infrastructure/persistence/providers/persistence-document.providers';


@Module({
  providers: [...PersistenceDocumentProviders],
  exports: [...PersistenceDocumentProviders],
})
export class DocumentDatabaseModule {}
