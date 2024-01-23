import { Module } from '@nestjs/common';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import { PresentationModule } from 'src/presentation/presentation.module';
import { IntegrationModule } from './integration/integration.module';

@Module({
  imports: [InfrastructureModule, PresentationModule, IntegrationModule],
})
export class MainModule {}
