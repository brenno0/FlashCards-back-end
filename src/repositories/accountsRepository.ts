import { Account, Prisma } from "generated/prisma";

export interface AccountsRepository {
    create(data: Prisma.AccountUncheckedCreateInput):Promise<Account>
    findByName(name:string, userId:string): Promise<Account | null>;
}