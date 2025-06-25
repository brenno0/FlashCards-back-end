import { Prisma, Transaction } from "generated/prisma";
import { TransactionsRepository } from "../transactionsRepository";
import { prisma } from "@/lib/prisma";

export class TransactionsPrismaRepository implements TransactionsRepository {
    async create(data: Prisma.TransactionUncheckedCreateInput): Promise<Transaction> {
        const transaction = await prisma.transaction.create({ data })
        
        return transaction;
    }
}