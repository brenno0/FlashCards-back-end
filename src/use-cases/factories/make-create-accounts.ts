import { CreateAccountsUseCase } from '../accounts/createAccounts';

import { AccountsPrismaRepository } from '@/repositories/prisma/accounts.repository.prisma';

export const makeAccounts = () => {
    const accountsRepository = new AccountsPrismaRepository();
    const useCase = new CreateAccountsUseCase(accountsRepository);

    return useCase;
};
