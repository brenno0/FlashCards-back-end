import { Prisma, Transaction } from "generated/prisma";

export interface TransactionsRepository {
    create(data: Prisma.TransactionCreateInput):Promise<Transaction>
}