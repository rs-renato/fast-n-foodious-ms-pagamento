import { Catch, HttpStatus } from '@nestjs/common';
import { IntegrationApplicationException } from 'src/application/exception/integration-application.exception';
import { ExceptionHandler } from 'src/presentation/rest/handler/exception.handler';

@Catch(IntegrationApplicationException)
export class IntegrationExceptionHandler extends ExceptionHandler<IntegrationApplicationException> {
  constructor() {
    super(HttpStatus.BAD_GATEWAY);
  }
}
