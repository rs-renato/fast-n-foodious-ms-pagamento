import { Provider } from '@nestjs/common';
import { PedidoIntegration } from 'src/integration/pedido/pedido.integration';

export const IntegrationProviders: Provider[] = [
  {
    provide: PedidoIntegration,
    useClass: PedidoIntegration,
  },
];
