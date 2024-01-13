import { Test, TestingModule } from '@nestjs/testing';
import { HealthRestApi } from 'src/presentation/rest/health/api/health.api';

describe('HealthRestApi', () => {
  let restApi: HealthRestApi;

  beforeEach(async () => {
    // Configuração do módulo de teste
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthRestApi],
    }).compile();

    // Desabilita a saída de log
    module.useLogger(false);

    // Obtém a instância do restApi e do serviço a partir do módulo de teste
    restApi = module.get<HealthRestApi>(HealthRestApi);
  });

  describe('health check', () => {
    it('deve retormnar up', async () => {
      const result = await restApi.check();
      expect(result.status).toEqual('OK');
    });
  });
});
