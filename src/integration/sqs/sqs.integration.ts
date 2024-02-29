import {
  SQSClient,
  ReceiveMessageCommand,
  Message,
  DeleteMessageCommand,
  SendMessageCommandOutput,
  SendMessageCommand,
  DeleteMessageCommandOutput,
} from '@aws-sdk/client-sqs';
import { Injectable, Logger } from '@nestjs/common';
import * as process from 'process';
import { IntegrationApplicationException } from 'src/application/exception/integration-application.exception';
import { SolicitaPagamentoPedidoUseCase } from 'src/application/pagamento/usecase';
import { EstadoPagamento } from 'src/enterprise/pagamento/enum/estado-pagamento.enum';
import { Pagamento } from 'src/enterprise/pagamento/model/pagamento.model';
import { setTimeout } from 'timers/promises';

@Injectable()
export class SqsIntegration {
  private logger = new Logger(SqsIntegration.name);

  private SQS_SOLICITAR_PAGAMENTO_REQ_URL = process.env.SQS_SOLICITAR_PAGAMENTO_REQ_URL;
  private SQS_WEBHOOK_PAGAMENTO_CONFIRMADO_RES_URL = process.env.SQS_WEBHOOK_PAGAMENTO_CONFIRMADO_RES_URL;
  private SQS_WEBHOOK_PAGAMENTO_REJEITADO_RES_URL = process.env.SQS_WEBHOOK_PAGAMENTO_REJEITADO_RES_URL;
  private SQS_MAX_NUMBER_MESSAGES = 1;
  private SQS_WAIT_TIME_SECONDS = 10;
  private SQS_VISIBILITY_TIMEOUT = 20;
  private SQS_CONSUMER_TIMEOUT = 5000;

  constructor(private sqsClient: SQSClient, private solicitarPagamentoPedidoUsecase: SolicitaPagamentoPedidoUseCase) {}

  startReceiveSolicitaParamentoPedido(): void {
    (async () => {
      while (true) {
        await this.receiveSolicitaPagamentoPedido()
          .then((messages) => {
            if (messages) {
              messages.forEach((message) => {
                this.logger.log(`mensagem consumida: ${JSON.stringify(message)}`);
                const body = JSON.parse(message.Body);
                this.solicitarPagamentoPedidoUsecase
                  .solicitaPagamento(body.pedidoId, body.totalPedido)
                  .then(async () => {
                    await this.deleteSolicitaPagamentoPedido(message);
                  });
              });
            }
          })
          .catch(async (err) => {
            this.logger.error(
              `receiveSolicitaPagamentoPedido: Erro ao consumir a mensagem da fila: ${JSON.stringify(err)}`,
            );
            await setTimeout(this.SQS_CONSUMER_TIMEOUT);
          });
      }
    })();
  }

  private async receiveSolicitaPagamentoPedido(): Promise<Message[]> {
    const command = new ReceiveMessageCommand({
      AttributeNames: ['CreatedTimestamp'],
      MessageAttributeNames: ['All'],
      QueueUrl: this.SQS_SOLICITAR_PAGAMENTO_REQ_URL,
      MaxNumberOfMessages: this.SQS_MAX_NUMBER_MESSAGES,
      WaitTimeSeconds: this.SQS_WAIT_TIME_SECONDS,
      VisibilityTimeout: this.SQS_VISIBILITY_TIMEOUT,
    });

    this.logger.verbose(
      `Invocando ReceiveMessageCommand para obtenção de solicitação de pagamento: ${JSON.stringify(command)}`,
    );

    return await this.sqsClient
      .send(command)
      .then((response) => {
        this.logger.verbose(`Resposta do receive message da fila: ${JSON.stringify(response)}`);
        return response.Messages;
      })
      .catch((error) => {
        this.logger.error(
          `Erro ao processar solicitação de pagamento: ${JSON.stringify(error)} - Command: ${JSON.stringify(command)}`,
        );
        throw new IntegrationApplicationException('Não foi possível processar a solicitação de pagamento.');
      });
  }

  private async deleteSolicitaPagamentoPedido(message: Message): Promise<DeleteMessageCommandOutput> {
    this.logger.debug(`Deletando mensagem da fila: ${JSON.stringify(message)}`);
    const command = new DeleteMessageCommand({
      QueueUrl: this.SQS_SOLICITAR_PAGAMENTO_REQ_URL,
      ReceiptHandle: message.ReceiptHandle,
    });
    this.logger.debug(
      `Invocando DeleteMessageCommand para remoção de mensagem de solicitação de pagamento: ${JSON.stringify(command)}`,
    );

    return await this.sqsClient.send(command).catch((error) => {
      this.logger.error(
        `Erro ao deletar da fila a solicitação de pagamento: ${JSON.stringify(error)} - Command: ${JSON.stringify(
          command,
        )}`,
      );
      throw new IntegrationApplicationException('Não foi possível deletar a solicitação de pagamento da fila.');
    });
  }

  async sendEstadoPagamentoPedido(pagamento: Pagamento): Promise<SendMessageCommandOutput> {
    const command = new SendMessageCommand({
      QueueUrl:
        pagamento.estadoPagamento === EstadoPagamento.CONFIRMADO
          ? this.SQS_WEBHOOK_PAGAMENTO_CONFIRMADO_RES_URL
          : this.SQS_WEBHOOK_PAGAMENTO_REJEITADO_RES_URL,
      MessageBody: JSON.stringify({
        pagamento: pagamento,
      }),
    });

    this.logger.debug(
      `Invocando SendMessageCommand para notificação de estado de pagamento do pedido: ${JSON.stringify(command)}`,
    );

    return await this.sqsClient
      .send(command)
      .then((response) => {
        this.logger.log(
          `Resposta do publish na fila de notificação de estado de pagamento do pedido: ${JSON.stringify(response)}`,
        );
        return response;
      })
      .catch((error) => {
        this.logger.error(
          `Erro ao publicar solicitação de pagamento: ${JSON.stringify(error)} - Command: ${JSON.stringify(command)}`,
        );
        throw new IntegrationApplicationException('Não foi possível solicitar o pagamento.');
      });
  }
}
