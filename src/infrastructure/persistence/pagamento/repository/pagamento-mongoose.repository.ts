import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PagamentoMongoDbEntity } from 'src/infrastructure/persistence/pagamento/schemas/pagamento.schema';
import { PagamentoDocument } from 'src/infrastructure/persistence/pagamento/interface/pagamento.interface';
import { CreatePagamentoDto } from 'src/infrastructure/persistence/pagamento/dto/create-pagamento.dto';
import { UpdatePagamentoDto } from 'src/infrastructure/persistence/pagamento/dto/update-pagamento.dto';
import { IRepository } from 'src/enterprise/repository/repository';
import { Pagamento } from 'src/enterprise/pagamento/model/pagamento.model';

@Injectable()
export class PagamentoMongoDbRepository implements IRepository<Pagamento> {
   private logger = new Logger(PagamentoMongoDbRepository.name);

   constructor(
      @InjectModel(PagamentoMongoDbEntity.name) private pagamentoModel: Model<PagamentoDocument>,
   ) {}

   save(pagamento: Pagamento): Promise<Pagamento> {
      this.logger.debug(`Salvando pagamento: ${JSON.stringify(pagamento)}`);

      const createPagamentoDto: CreatePagamentoDto = {
         id: pagamento.id,
         pedidoId: pagamento.pedidoId,
         transacaoId: pagamento.transacaoId,
         estadoPagamento: pagamento.estadoPagamento,
         total: pagamento.total,
         dataHoraPagamento: pagamento.dataHoraPagamento,
      }

      const createdPagamento = new this.pagamentoModel(createPagamentoDto);
      return createdPagamento.save().then(
         (pagamentoDocument) => {
            this.logger.debug(`Pagamento salvo com sucesso no banco de dados: ${pagamentoDocument.id}`);
            return {
               id: pagamentoDocument.id,
               pedidoId: pagamentoDocument.pedidoId,
               transacaoId: pagamentoDocument.transacaoId,
               estadoPagamento: pagamentoDocument.estadoPagamento,
               total: pagamentoDocument.total,
               dataHoraPagamento: pagamentoDocument.dataHoraPagamento,
            }
         }
      )
    }
    edit(type: Pagamento): Promise<Pagamento> {
        throw new Error('Method not implemented.');
    }
    delete(id: number): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    findAll(): Promise<Pagamento[]> {
        throw new Error('Method not implemented.');
    }

   async createPagamento(
      createPagamentoDto: CreatePagamentoDto,
   ): Promise<PagamentoDocument> {
      const createdPagamento = new this.pagamentoModel(createPagamentoDto);
      return createdPagamento.save();
   }

   async updatePagamento(
      pagamentoId: number,
      updatePagamentoDto: UpdatePagamentoDto,
   ): Promise<PagamentoDocument> {
      const pagamento = await this.pagamentoModel
         .find({
            id: pagamentoId,
         })
         .lean()
         .then((pagamento) => {
            return pagamento[0];
         });

      this.logger.log(`updatedPagamento = ${JSON.stringify(pagamento)}`);

      const updatedPagamento = await this.pagamentoModel.findByIdAndUpdate(
         pagamento._id,
         updatePagamentoDto,
         { new: true }, // retorna o novo documento atualizado
      );

      this.logger.log(`updatedPagamento = ${JSON.stringify(updatedPagamento)}`);

      if (!updatedPagamento) {
         throw new Error(`Pagamento ${updatePagamentoDto.id} not found`);
      }
      return updatedPagamento;
   }

   async findBy(query: any): Promise<PagamentoDocument[]> {
      return this.pagamentoModel.find(query);
   }
}
