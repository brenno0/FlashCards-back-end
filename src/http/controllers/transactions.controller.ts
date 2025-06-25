import { MissingDateParamsError } from "@/use-cases/errors/missingDateParams";
import { makeGetTransactions } from "@/use-cases/factories/make-get-transactions";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from 'zod';

export const getTransactions = async (request:FastifyRequest,reply:FastifyReply) => {
    try{
        const getManyTransactions = makeGetTransactions();
        
        const transactionsBodySchema = z.object({
            accountId:z.string().optional(),
            amount:z.string().optional(),
            startDate:z.date().optional(),
            finalDate:z.date().optional(),
            description:z.string().optional(),
            id:z.string().optional(),
            type:z.enum(['INCOME','EXPENSE']).optional()
        })

        const params = transactionsBodySchema.parse(request.query)
        const { sub } = request.user

        const { transactions } = await getManyTransactions.execute({
            params,
            userId:sub
        });

        reply.status(200).send(transactions)
      
    }catch(error) {
        if(error instanceof MissingDateParamsError) reply.status(400).send({ message: error.message })
       return reply.status(500).send({ message: "Internal server error." });
    }
}