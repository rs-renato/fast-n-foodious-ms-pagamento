import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseRestApi } from 'src/presentation/rest/base.api';

@Controller(['/', '/health'])
@ApiTags('Health')
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
