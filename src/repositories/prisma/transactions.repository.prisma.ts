import { Prisma, Transaction } from "generated/prisma";
import { SearchManyTransactionsParams, TransactionsRepository } from "../transactionsRepository";
import { prisma } from "@/lib/prisma";

export class TransactionsPrismaRepository implements TransactionsRepository {

    async create(data: Prisma.TransactionUncheckedCreateInput): Promise<Transaction> {
        const transaction = await prisma.transaction.create({ data })
        
        return transaction;
    }

    async searchMany(query: SearchManyTransactionsParams, userId: string): Promise<Transaction[]> {
        const { 
            accountId = undefined,
            amount = undefined,
            description = undefined,
            finalDate = undefined,
            id = undefined,
            startDate = undefined,
            type = undefined 
        } = query;

        const dateFilter: Prisma.DateTimeFilter = {}
        const amountFilter: Prisma.FloatFilter = {}

        if (startDate) {
            dateFilter.gte = new Date(startDate)
        }
        if (finalDate) {
            dateFilter.lte = new Date(finalDate)
        }

        if(amount) {
            amountFilter.gte = Math.floor(Number(amount))
            amountFilter.lte = Math.ceil(Number(amount))
        }
        
        const transaction = await prisma.transaction.findMany({
            where: {
                userId,
                accountId,
                description: {
                    contains:description
                },
                id,
                type,
                ...(amount ? { amount: amountFilter} : {}),
                ...(startDate || finalDate ? { date: dateFilter } : {})
            }
        })
        console.log('transaction', transaction)
        return transaction;
    }
}