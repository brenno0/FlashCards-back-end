import { TransactionsPrismaRepository } from "@/repositories/prisma/transactions.repository.prisma";
import { SaveItauTransactionsUseCase } from "../transactions/saveItauTransactions";

export const makeImportItauStatement = () => {
    const transactionsRepository = new TransactionsPrismaRepository()
    const useCase = new SaveItauTransactionsUseCase(transactionsRepository)

    return useCase;
}