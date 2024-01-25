import { Test, TestingModule } from '@nestjs/testing';
import { PagamentoMongoDbEntity } from 'src/infrastructure/persistence/pagamento/schemas/pagamento.schema';
import { Model } from 'mongoose';
import { PagamentoDocument } from 'src/infrastructure/persistence/pagamento/interface/pagamento.interface';
import { Pagamento } from 'src/enterprise/pagamento/model/pagamento.model';
import { PagamentoMongoDbRepository } from 'src/infrastructure/persistence/pagamento/repository/pagamento-mongoose.repository';
import { EstadoPagamento } from 'src/enterprise/pagamento/enum/estado-pagamento.enum';
import { PagamentoConstants } from 'src/shared/constants';
import { IRepository } from 'src/enterprise/repository/repository';
import { getModelToken } from '@nestjs/mongoose';
import { RepositoryException } from 'src/infrastructure/exception/repository.exception';

describe('PagamentoMongoDbRepository', () => {
  let repository: IRepository<Pagamento>;
  let pagamentoDocument: Model<PagamentoDocument>;

  const pagamento: Pagamento = {
    pedidoId: 1,
    transacaoId: 'transacaoId',
    estadoPagamento: EstadoPagamento.CONFIRMADO,
    total: 10.00,
    dataHoraPagamento: new Date('2023-08-30'),
    _id: '12345',
  };

  const pagamentoEditado: Pagamento = {
    pedidoId: 1,
    transacaoId: 'transacaoId',
    estadoPagamento: EstadoPagamento.REJEITADO,
    total: 200.00,
    dataHoraPagamento: new Date('2023-08-31'),
    _id: '12345',
  };

  let mockSave = true;
  function mockMongooseFunctions() {
    this.save  = () => Promise.resolve(pagamento);
  }

  beforeEach(async () => {
    
    const module: TestingModule = await Test.createTestingModule({
      // imports: [MongooseModule.forFeature([{ name: PagamentoMongoDbEntity.name, schema: PagamentoSchema }])],
      providers: [
        {
          provide: PagamentoConstants.IREPOSITORY,
          inject: [getModelToken(PagamentoMongoDbEntity.name)],
          useFactory: (pagamentoModel: Model<PagamentoDocument>): IRepository<Pagamento> => {
            return new PagamentoMongoDbRepository(pagamentoModel);
          }
        },
        {
          provide: getModelToken(PagamentoMongoDbEntity.name),
          useValue: mockSave ? mockMongooseFunctions : {
            findByIdAndUpdate: jest.fn((id, p) => {
              return p.total === 200 ? Promise.resolve(pagamento) : Promise.resolve(undefined)
            }),
            find: jest.fn().mockResolvedValue([pagamento]),
          }
        }
      ],
    }).compile();

     // Desabilita a saída de log
     module.useLogger(false);
     
    repository = module.get<IRepository<Pagamento>>(PagamentoConstants.IREPOSITORY);
    pagamentoDocument = module.get<Model<PagamentoDocument>>(getModelToken(PagamentoMongoDbEntity.name));
  });

  describe('injeção de dependências', () => {
    it('deve existir instâncias de repositório mongoose definida', async () => {
      expect(pagamentoDocument).toBeDefined();
    });
  });

  describe('save', () => {
    it('should save a payment', async () => {
      const result = await repository.save(pagamento);
      expect(result).toEqual(pagamento);
      mockSave=false
    });
  });

  describe('edit', () => {
    it('should edit a payment', async () => {
      pagamento.estadoPagamento = EstadoPagamento.REJEITADO;
      pagamento.total = 200.00;
      pagamento.dataHoraPagamento = new Date('2023-08-31');
      const result = await repository.edit(pagamento);
      expect(result).toEqual(pagamentoEditado);
    });

    it('should not edit a payment', async () => {
      pagamentoEditado.total = 999.99;
      await expect(repository.edit(pagamentoEditado)).rejects.toThrowError(RepositoryException);
    });
  });


  describe('findBy', () => {
    it('should find payments', async () => {
      const result = await repository.findBy({ pedidoId: 1 });
      expect(result).toEqual([pagamento]);
    });
  });
});
