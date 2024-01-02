import { ForbiddenException, ServiceUnavailableException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom, map } from 'rxjs';

@Injectable()
export class PedidoIntegration {
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

   async getPedidoById(id: number) {
      const request = this.httpService
         .get(`http://localhost:3000/v1/pedido/${id}`)
         .pipe(map((res) => res.data))
         .pipe(
            catchError(() => {
               throw new ServiceUnavailableException('API not available');
            }),
         );

      return await lastValueFrom(request);
   }
}
