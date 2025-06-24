import { TransactionsPrismaRepository } from "@/repositories/prisma/transactions.repository.prisma";
import { InvalidFileFormat } from "@/use-cases/errors/invalidFileFormat";
import { NoCSVFileError } from "@/use-cases/errors/noCsvFileError";
import { SaveNubankTransactionsUseCase } from "@/use-cases/saveNubankTransactions";
import { FastifyInstance } from "fastify";

export const loadBilling = (app: FastifyInstance) => {
  app.post('/import-statement', async (request, reply) => {

    try{

      const data = await request.file();

      const transactionsRepository = new TransactionsPrismaRepository()
      const saveNubankTransactionsUseCase = new SaveNubankTransactionsUseCase(transactionsRepository)
      
      const { records } = await saveNubankTransactionsUseCase.execute({ data })

      reply.send({ message: 'CSV parsed successfully', data: records });

    }catch(error) {
      if(error instanceof NoCSVFileError) return reply.status(400).send({ error: error.message });
      if(error instanceof InvalidFileFormat) return reply.status(415).send({ error: error.message });
    }
    
   
      
  })
}