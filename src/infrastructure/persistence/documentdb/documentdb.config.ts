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
        uri: `mongodb://${configService.get<string>('DYNAMODB_URI')}`,
        dbName: configService.get<string>('DYNAMODB_DATABASE'),
        auth:{
          username: configService.get<string>('DYNAMODB_USER'),
          password: configService.get<string>('DYNAMODB_PASSWORD'),
        } ,
        authSource: "admin",
        autoCreate: DatabaseDocConstants.DATABASE_DOC_AUTO_CREATE,
        tls: DatabaseDocConstants.DATABASE_DOC_TLS,
        tlsInsecure: DatabaseDocConstants.DATABASE_DOC_TLS_INSECURE,
        tlsCAFile: configService.get<string>('DYNAMODB_DATABASE_TLS_CA_FILE'), 
      }),
      inject: [ConfigService],
    },
  ],
  exports: [DatabaseDocConstants.DATABASE_DOC_CONFIG_NAME],
})
export class DocumentdbConfig {}