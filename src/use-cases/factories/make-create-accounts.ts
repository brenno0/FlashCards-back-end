import { AccountsPrismaRepository } from "@/repositories/prisma/accounts.repository.prisma";
import { CreateAccountsUseCase } from "../accounts/createAccounts";

export const makeAccounts = () => {
    const accountsRepository = new AccountsPrismaRepository()
    const useCase = new CreateAccountsUseCase(accountsRepository);

    return useCase
}