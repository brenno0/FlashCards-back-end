import { Prisma, Transaction } from "generated/prisma";
import { TransactionsRepository } from "../transactionsRepository";
import { prisma } from "@/lib/prisma";

export class TransactionsPrismaRepository implements TransactionsRepository {
    create(data: Prisma.TransactionCreateInput): Promise<Transaction> {
        const transaction = prisma.transaction.create({ data })
        
        return transaction;
    }
}