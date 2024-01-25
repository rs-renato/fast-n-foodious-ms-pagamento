import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PagamentoMongoDbEntity } from 'src/infrastructure/persistence/pagamento/schemas/pagamento.schema';
import { PagamentoDocument } from 'src/infrastructure/persistence/pagamento/interface/pagamento.interface';
import { CreatePagamentoDto } from 'src/infrastructure/persistence/pagamento/dto/create-pagamento.dto';
import { UpdatePagamentoDto } from 'src/infrastructure/persistence/pagamento/dto/update-pagamento.dto';
import { IRepository } from 'src/enterprise/repository/repository';
import { Pagamento } from 'src/enterprise/pagamento/model/pagamento.model';
import { RepositoryException } from 'src/infrastructure/exception/repository.exception';

@Injectable()
export class PagamentoMongoDbRepository implements IRepository<Pagamento> {
  private logger = new Logger(PagamentoMongoDbRepository.name);

  constructor(@InjectModel(PagamentoMongoDbEntity.name) private pagamentoModel: Model<PagamentoDocument>) {}

  async save(pagamento: Pagamento): Promise<Pagamento> {
    this.logger.debug(`Salvando pagamento: ${JSON.stringify(pagamento)}`);

    const createPagamentoDto: CreatePagamentoDto = {
      pedidoId: pagamento.pedidoId,
      transacaoId: pagamento.transacaoId,
      estadoPagamento: pagamento.estadoPagamento,
      total: pagamento.total,
    };

    const createdPagamento = new this.pagamentoModel(createPagamentoDto);
    return createdPagamento.save().then((pagamentoDocument) => {
      this.logger.debug(`Pagamento salvo com sucesso no banco de dados: ${JSON.stringify(pagamentoDocument)}`);
      return {
        _id: pagamentoDocument._id.toString(),
        pedidoId: pagamentoDocument.pedidoId,
        transacaoId: pagamentoDocument.transacaoId,
        estadoPagamento: pagamentoDocument.estadoPagamento,
        total: pagamentoDocument.total,
        dataHoraPagamento: pagamentoDocument.dataHoraPagamento,
      };
    });
  }
  async edit(pagamento: Pagamento): Promise<Pagamento> {
    this.logger.debug(`Editando pagamento: ${JSON.stringify(pagamento)}`);
    const pagamentoDocument = await this.pagamentoModel
      .find({
        _id: pagamento._id,
      })
      //.lean()
      .then((returnedPagamentoDocument) => {
        return returnedPagamentoDocument[0];
      });

    this.logger.log(`pagamentoDocument = ${JSON.stringify(pagamentoDocument)}`);

    const updatePagamentoDto: UpdatePagamentoDto = {
      pedidoId: pagamento.pedidoId,
      transacaoId: pagamento.transacaoId,
      estadoPagamento: pagamento.estadoPagamento,
      total: pagamento.total,
      dataHoraPagamento: pagamento.dataHoraPagamento,
    };
    const updatedPagamento = await this.pagamentoModel.findByIdAndUpdate(
      pagamentoDocument._id,
      updatePagamentoDto,
      { new: true }, // retorna o novo documento atualizado
    );

    this.logger.log(`updatedPagamento = ${JSON.stringify(updatedPagamento)}`);

    if (!updatedPagamento) {
      throw new RepositoryException(`Pagamento ${pagamento._id} not found`);
    }
    const pagamentoEditado: Pagamento = {
      _id: updatedPagamento._id.toString(),
      pedidoId: updatedPagamento.pedidoId,
      transacaoId: updatedPagamento.transacaoId,
      estadoPagamento: updatedPagamento.estadoPagamento,
      total: updatedPagamento.total,
      dataHoraPagamento: updatedPagamento.dataHoraPagamento,
    };
    this.logger.debug(`Pagamento editado com sucesso: ${JSON.stringify(pagamentoEditado)}`);
    return pagamentoEditado;
  }

  async findBy(attributes: Partial<Pagamento>): Promise<Pagamento[]> {
    const pagamentos: Pagamento[] = [];
    await this.pagamentoModel.find(attributes).then((documents) => {
      for (const document of documents) {
        pagamentos.push({
          _id: document._id.toString(),
          pedidoId: document.pedidoId,
          transacaoId: document.transacaoId,
          estadoPagamento: document.estadoPagamento,
          total: document.total,
          dataHoraPagamento: document.dataHoraPagamento,
        });
        this.logger.log(`pagamentos = ${JSON.stringify(pagamentos)}`);
      }
    });

    this.logger.log(`pagamentos = ${JSON.stringify(pagamentos)}`);
    return pagamentos;
  }
}
