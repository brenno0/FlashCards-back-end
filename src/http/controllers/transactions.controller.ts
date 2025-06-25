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
        console.log('error', error)
       return reply.status(500).send({ error: "Internal server error." });
    }
}