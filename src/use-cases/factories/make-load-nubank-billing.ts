import { TransactionsPrismaRepository } from "@/repositories/prisma/transactions.repository.prisma"
import { SaveNubankTransactionsUseCase } from "../saveNubankTransactions"

export const makeNubankBilling = () => {
    const transactionsRepository = new TransactionsPrismaRepository()
    const useCase = new SaveNubankTransactionsUseCase(transactionsRepository)

    return useCase;
}