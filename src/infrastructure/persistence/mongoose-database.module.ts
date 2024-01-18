import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PagamentoMongoDbEntity, PagamentoSchema } from 'src/infrastructure/persistence/pagamento/schemas/pagamento.schema';
import { PersistenceMongooseProviders } from 'src/infrastructure/persistence/providers/persistence-mongoose.providers';

@Module({
  imports: [
    // TODO RODRIGO; restore login/password after push
     MongooseModule.forRoot(
      'mongodb://XXXX:YYYYY@ms-pagamento.cluster-ckg4xk3zk3oc.us-east-1.docdb.amazonaws.com:27017/pagamento?tls=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false',
       {
         tlsCAFile: 'global-bundle.pem'
       }
    ),
     // mongodb://fnfuser:<insertYourPassword>@ms-pagamento.cluster-ckg4xk3zk3oc.us-east-1.docdb.amazonaws.com:27017/?tls=true&tlsCAFile=global-bundle.pem&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false
    // MongooseModule.forRoot(
    //   'mongodb+srv://root:root@cluster-curso.isaztka.mongodb.net/pagamento-db',
    // ),
    MongooseModule.forFeature([
      { name: PagamentoMongoDbEntity.name, schema: PagamentoSchema },
    ]),
  ],
  providers: [...PersistenceMongooseProviders],
  exports: [...PersistenceMongooseProviders],
})
export class PagamentoMongooseModule {}
