import { TransactionsPrismaRepository } from "@/repositories/prisma/transactions.repository.prisma"
import { GetTransactionsUseCase } from "../transactions/getTransactions";

export const makeGetTransactions = () => {
    const transactionsRepository = new TransactionsPrismaRepository();
    const useCase = new GetTransactionsUseCase(transactionsRepository);

    return useCase;
}