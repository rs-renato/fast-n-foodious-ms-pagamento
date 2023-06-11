import { Injectable, Logger } from "@nestjs/common";
import { Cliente } from "../../../../domain/cliente/model/cliente.model";
import { IRepository } from "../../../../domain/repository/repository";

@Injectable()
export class ClienteMemoryRepository implements IRepository<Cliente>{
    private logger: Logger = new Logger(ClienteMemoryRepository.name)

    private repository: Array<Cliente> = []
    private static ID_COUNT = 0;
    
    async findBy(attributes: {}): Promise<Cliente[]> {
        this.logger.debug(`Realizando consulta de cliente: com os parâmetros ${JSON.stringify(attributes)}`)
        return new Promise((resolve) => {
            resolve(
                this.repository.filter(cliente => {
                    return Object.entries(attributes).every(([key, value]) => {
                        return cliente[key] === value;
                    })
                })
            )
        })    
    }

    async save(cliente: Cliente): Promise<Cliente>{
        this.logger.debug(`Salvando cliente: ${cliente}`)
        return new Promise<Cliente>((resolve) => {
            this.repository.push(cliente)
            cliente.id = ++ClienteMemoryRepository.ID_COUNT
            resolve(cliente)
        });
    }
}