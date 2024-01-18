import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'src/infrastructure/persistence/database.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/envs/${process.env.NODE_ENV || 'prod'}.env`
    }),
    DatabaseModule.forFeature()],
  exports: [DatabaseModule.forFeature()],
})
export class InfrastructureModule {}
