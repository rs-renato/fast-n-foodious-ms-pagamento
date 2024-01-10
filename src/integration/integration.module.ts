import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PedidoIntegration } from './pedido/pedido.integration';

@Module({
  imports: [HttpModule], // imported axios/HttpModule
  providers: [PedidoIntegration],
  exports: [PedidoIntegration],
})
export class IntegrationModule {}
