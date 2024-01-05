import { ForbiddenException, NotFoundException, ServiceUnavailableException, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom, map } from 'rxjs';
import { PedidoDto } from './pedido-dto.integration';

@Injectable()
export class PedidoIntegration {

   private logger = new Logger(PedidoIntegration.name);

   constructor(private httpService: HttpService) {}

   // async getBitcoinPriceUSD() {
   //    return this.httpService
   //       .get('https://api.coindesk.com/v1/bpi/currentprice.json')
   //       .pipe(
   //          map((res) => res.data?.bpi),
   //          map((bpi) => bpi?.USD),
   //          map((usd) => {
   //             return usd?.rate;
   //          }),
   //       )
   //       .pipe(
   //          catchError(() => {
   //             throw new ForbiddenException('API not available');
   //          }),
   //       );
   // }

   async sample() {
      const request = this.httpService
         .get('https://catfact.ninja/fact')
         .pipe(map((res) => res.data))
         .pipe(
            catchError(() => {
               throw new ForbiddenException('API not available');
            }),
         );

      return await lastValueFrom(request);
   }

   async getPedidoById(id: number): Promise<PedidoDto> {
      const request = this.httpService
         .get(`http://localhost:3000/v1/pedido/${id}`)
         .pipe(map((res) => res.data))
         .pipe(
            catchError((error ) => {
               const statusError = error.response.status;
               if (statusError === 404) {
                 throw new NotFoundException(`Pedido ${id} não encontrado.`);
               }
               throw new ServiceUnavailableException('Não foi possível realizar a integração com o MS de Pedido.');
            }),
         );

      const pedidoByIdResponse = await lastValueFrom(request);


      const pedidoDto = PedidoDto.fromJson(pedidoByIdResponse);

      this.logger.debug("pedidoByIdResponse: " + JSON.stringify(pedidoByIdResponse));
      this.logger.debug("PedidoDTO: " + JSON.stringify(pedidoDto));

      return pedidoDto;
   }
}
