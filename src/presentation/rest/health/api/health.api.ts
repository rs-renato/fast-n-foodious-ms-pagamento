import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { BaseRestApi } from 'src/presentation/rest/base.api';

@ApiExcludeController()
@Controller(['/', '/health'])
export class HealthRestApi extends BaseRestApi {
  @Get()
  @ApiOperation({
    summary: 'Health Check',
    description: 'Verifica status da aplicação',
  })
  @ApiOkResponse({ description: 'Aplicação UP' })
  async check(): Promise<any> {
    return Promise.resolve({
      status: 'OK',
    });
  }
}
