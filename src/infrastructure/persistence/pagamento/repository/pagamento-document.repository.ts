import { Injectable, Logger } from '@nestjs/common';
import { Pagamento } from 'src/enterprise/pagamento/model/pagamento.model';
import { IRepository } from 'src/enterprise/repository/repository';

@Injectable()
export class PagamentoDocumentRepository implements IRepository<Pagamento> {
  private logger: Logger = new Logger(PagamentoDocumentRepository.name);

  async findBy(attributes: Partial<Pagamento>): Promise<Pagamento[]> {
    return;
  }

  async save(pagamento: Pagamento): Promise<Pagamento> {
    return;
  }

  async edit(pagamento: Pagamento): Promise<Pagamento> {
    return;
  }

  async delete(pagamentoId: number): Promise<boolean> {
    return;
  }

  async findAll(): Promise<Pagamento[]> {
    return;
  }
}
