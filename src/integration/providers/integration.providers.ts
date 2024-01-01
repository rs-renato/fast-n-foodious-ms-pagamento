import { Provider } from '@nestjs/common';
import { PedidoIntegration } from '../pedido/pedido.integration';
import { HttpService } from '@nestjs/axios';

export const IntegrationProviders: Provider[] = [
   {
      provide: 'PedidoIntegration',
      useClass: PedidoIntegration,
      // inject: [HttpService],
      // useFactory: (httpService: HttpService): PedidoIntegration => new PedidoIntegration(httpService),
   },
];
