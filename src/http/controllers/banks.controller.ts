import { BanksPrismaRepository } from "@/repositories/prisma/banks.repository.prisma";
import { CreateBanksUseCase } from "@/use-cases/banks/createBanks";
import { BankAlreadyExistsError } from "@/use-cases/errors/bankAlreadyExists";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from 'zod';
export const createBanks = async (request:FastifyRequest,reply:FastifyReply) => {
    try{
        const banksRepository = new BanksPrismaRepository();

        const createBanksUseCase = new CreateBanksUseCase(banksRepository);
        
      const bankBodySchema = z.object({
        name:z.string(),
        imageUrl:z.string().default('')
      })
      const { imageUrl, name } = bankBodySchema.parse(request.body)

      const { bank } = await createBanksUseCase.execute({
        name,
        imageUrl
      });

      reply.status(201).send(bank)
      
    }catch(error) {
      if(error instanceof BankAlreadyExistsError) return reply.status(400).send({ error: error.message });
    }
}