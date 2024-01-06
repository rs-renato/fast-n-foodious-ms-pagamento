import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MainModule } from 'src/main.module';

describe('HealthRestApi (e2e)', () => {
   let app: INestApplication;

   beforeAll(async () => {
      // Configuração do módulo de teste
      const module: TestingModule = await Test.createTestingModule({
         imports: [MainModule],
      }).compile();

      // Desabilita a saída de log
      module.useLogger(false);

      app = module.createNestApplication();

      // Configuração de validações global inputs request
      app.useGlobalPipes(new ValidationPipe({ stopAtFirstError: true }));
      await app.init();
   });

   afterAll(async () => {
      await app.close();
   });

   it('GET /health - deve retornar OK', async () => {
      return await request(app.getHttpServer())
         .get('/health')
         .then((response) => {
            expect(response.status).toEqual(200);
            expect(response.body.status).toEqual('OK');
         });
   });
});
