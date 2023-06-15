import { Test, TestingModule } from '@nestjs/testing';
import { Cliente } from 'src/domain/cliente/model/cliente.model';
import { IRepository } from 'src/domain/repository/repository';
import { CpfUnicoClienteValidator } from '../validation/cpf-unico-cliente.validator';

describe('CpfUnicoClienteValidator', () => {
  let validator: CpfUnicoClienteValidator
  let repository: IRepository<Cliente>

  const cliente: Cliente = {
    id:1,
    nome: 'Teste',
    email: 'teste@teste.com',
    cpf: '123456789',
  };
  
  beforeEach(async () => {
    // Configuração do módulo de teste
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CpfUnicoClienteValidator,
        // Mock do serviço IRepository<Cliente>
        {
          provide: 'IRepository<Cliente>',
          useValue: {
            findBy: jest.fn((attributes) => {
                // retorna vazio, sumulando que não encontrou registros pelo atributos passados por parâmetro
                return Promise.resolve({})
            }),
          },
        },
      ],
    }).compile();

    // Obtém a instância do serviço e repositório a partir do módulo de teste
    repository = module.get<IRepository<Cliente>>('IRepository<Cliente>')
    validator = module.get<CpfUnicoClienteValidator>(CpfUnicoClienteValidator)
  });

  describe('validate', () => {
    it('deve existir instância de repositório definida', async () => {  
        expect(repository).toBeDefined()
    });

    it('deve validar cliente com cpf único', async () => {
        
        let repositySpy = jest.spyOn(repository, 'findBy');

        await validator.validate(cliente)
            .then((unique) => {
                expect(unique).toBeTruthy()
            })
        
        expect(repositySpy).toHaveBeenCalledWith({cpf: cliente.cpf})
    });

    it('deve validar cliente com cpf não-único', async () => {
        // mock de repositório retornando um cliente
        repository.findBy = jest.fn().mockImplementation((attributes) => {
            return Promise.resolve([cliente])
        })

        await expect(validator.validate(cliente)).rejects.toThrowError(CpfUnicoClienteValidator.CPF_UNICO_CLIENTE_VALIDATOR_ERROR_MESSAGE)
    });

  });
});
