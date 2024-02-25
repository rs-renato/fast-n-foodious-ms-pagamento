import {
  SQSClient,
  ReceiveMessageCommand,
  ReceiveMessageCommandOutput,
  Message,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs';
import { Injectable, Logger } from '@nestjs/common';
import * as process from 'process';
import { IntegrationApplicationException } from 'src/application/exception/integration-application.exception';
import { SolicitaPagamentoPedidoUseCase } from 'src/application/pagamento/usecase';
import { setTimeout } from 'timers/promises';

@Injectable()
export class PagamentoSqsIntegration {
  private logger = new Logger(PagamentoSqsIntegration.name);

  private SQS_SOLICITAR_PAGAMENTO_REQ_URL = process.env.SQS_SOLICITAR_PAGAMENTO_REQ_URL;
  private SQS_MAX_NUMBER_MESSAGES = 1;
  private SQS_WAIT_TIME_SECONDS = 5;
  private SQS_VISIBILITY_TIMEOUT = 20;
  private SQS_CONSUMER_TIMEOUT = 5000;

  constructor(private sqsClient: SQSClient, private solicitarPagamentoPedidoUsecase: SolicitaPagamentoPedidoUseCase) {}

  start(): void {
    (async () => {
      while (true) {
        await this.processSolicitaPagamentoPedido()
          .then((messages) => {
            if (messages) {
              messages.forEach((message) => {
                this.logger.log(`mensagem consumida: ${JSON.stringify(message)}`);
                const body = JSON.parse(message.Body);
                this.solicitarPagamentoPedidoUsecase
                  .solicitaPagamento(body.pedidoId, body.totalPedido)
                  .then((pagamento) => {
                    this.logger.log(`Pagamento consumido da fila: ${JSON.stringify(pagamento)}`);
                  });
              });
            }
          })
          .catch(async (err) => {
            this.logger.error(`Erro ao consumir a mensagem da fila: ${JSON.stringify(err)}`);
            await setTimeout(this.SQS_CONSUMER_TIMEOUT);
          });
      }
    })();
  }

  async processSolicitaPagamentoPedido(): Promise<Message[]> {
    this.logger.debug(
      `processSolicitaPagamentoPedido: invocando serviço de integração em ${this.SQS_SOLICITAR_PAGAMENTO_REQ_URL}`,
    );

    const command = new ReceiveMessageCommand({
      AttributeNames: ['CreatedTimestamp'],
      MessageAttributeNames: ['All'],
      QueueUrl: this.SQS_SOLICITAR_PAGAMENTO_REQ_URL,
      MaxNumberOfMessages: this.SQS_MAX_NUMBER_MESSAGES,
      WaitTimeSeconds: this.SQS_WAIT_TIME_SECONDS,
      VisibilityTimeout: this.SQS_VISIBILITY_TIMEOUT,
    });

    return await this.sqsClient
      .send(command)
      .then((response) => {
        this.logger.debug(`Resposta do receive message da fila: ${JSON.stringify(response)}`);
        return response.Messages;
      })
      .then(async (messages) => {
        if (messages && messages.length) {
          this.logger.debug(`Deletando mensagem da fila: ${JSON.stringify(messages)}`);
          const command = new DeleteMessageCommand({
            QueueUrl: this.SQS_SOLICITAR_PAGAMENTO_REQ_URL,
            ReceiptHandle: messages[0].ReceiptHandle,
          });
          await this.sqsClient.send(command);
        }
        return messages;
      })
      .catch((error) => {
        this.logger.error(
          `Erro ao processar solicitação de pagamento: ${JSON.stringify(error)} - Command: ${JSON.stringify(command)}`,
        );
        throw new IntegrationApplicationException('Não foi possível processar a solicitação de pagamento.');
      });
  }
}
