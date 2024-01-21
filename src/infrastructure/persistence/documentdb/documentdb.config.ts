import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseDocConstants } from 'src/infrastructure/persistence/documentdb/documentdb.constants';
import { MongooseModuleOptions } from '@nestjs/mongoose';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DatabaseDocConstants.DATABASE_DOC_CONFIG_NAME,
      useFactory: (configService: ConfigService): MongooseModuleOptions => ({
        uri: `${configService.get<string>('DOCUMENTDB_URI')}`,
        dbName: configService.get<string>('DOCUMENTDB_DATABASE'),
        auth: {
          username: configService.get<string>('DOCUMENTDB_USER'),
          password: configService.get<string>('DOCUMENTDB_PASSWORD'),
        },
        authSource: 'admin',
        autoCreate: DatabaseDocConstants.DATABASE_DOC_AUTO_CREATE,
        tls: DatabaseDocConstants.DATABASE_DOC_TLS,
        tlsInsecure: DatabaseDocConstants.DATABASE_DOC_TLS_INSECURE,
        tlsCAFile: configService.get<string>('DOCUMENTDB_DATABASE_TLS_CA_FILE'),
        retryAttempts: 5,
      }),
      inject: [ConfigService],
    },
  ],
  exports: [DatabaseDocConstants.DATABASE_DOC_CONFIG_NAME],
})
export class DocumentdbConfig {}
