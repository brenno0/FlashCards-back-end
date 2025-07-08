import { optionalDateSchema } from "@/lib/schemas/optionalDateSchema";
import { MissingDateParamsError } from "@/use-cases/errors/missingDateParams";
import { makeGetTransactions } from "@/use-cases/factories/make-get-transactions";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from 'zod';

export const getTransactions = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const getManyTransactions = makeGetTransactions();
        
        const transactionsBodySchema = z.object({
            accountId: z.string().optional(),
            amount: z.string().optional(),
            startDate: optionalDateSchema,
            finalDate: optionalDateSchema,
            description: z.string().optional(),
            id: z.string().optional(),
            type: z.enum(['INCOME', 'EXPENSE']).optional()
        });

        const params = transactionsBodySchema.parse(request.query);
        const { sub } = request.user;

        const { transactions } = await getManyTransactions.execute({
            params,
            userId: sub
        });

        reply.status(200).send(transactions);
      
    } catch (error) {
        if (error instanceof z.ZodError) {
            const dateErrors = error.errors.filter(err => 
                err.path.includes('startDate') || err.path.includes('finalDate')
            );
            
            if (dateErrors.length > 0) {
                return reply.status(400).send({ 
                    message: "Invalid date format. Please use ISO format (YYYY-MM-DD) or a valid date string.",
                    errors: dateErrors,
                    error: 'DateValidationError'
                });
            }
            
            return reply.status(400).send({ 
                message: "Invalid query parameters", 
                errors: error.errors,
                error: 'ValidationError'
            });
        }
        
        if (error instanceof MissingDateParamsError) {
            return reply.status(400).send({ 
                message: error.message, 
                error: 'MissingDateParamsError' 
            });
        }
        
        return reply.status(500).send({ message: "Internal server error." });
    }
}