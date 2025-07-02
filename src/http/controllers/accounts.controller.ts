import { AccountAlreadyExistsError } from "@/use-cases/errors/accountAlreadyExists";
import { makeAccounts } from "@/use-cases/factories/make-create-accounts";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from 'zod';

export const createAccounts = async (request:FastifyRequest,reply:FastifyReply) => {
    try{
        const createAccountsUseCase = makeAccounts();
        
        const accountBodySchema = z.object({
            name:z.string(),
        })

        const { name } = accountBodySchema.parse(request.body)
        const { sub } = request.user

        const { account } = await createAccountsUseCase.execute({
            name,
            userId:sub
        });

        reply.status(201).send(account)
      
    }catch(error) {
      if(error instanceof AccountAlreadyExistsError) return reply.status(400).send({ message: error.message, error:'AccountAlreadyExistsError' });
    }
}