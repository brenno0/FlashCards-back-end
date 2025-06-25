import { Prisma, Account } from "generated/prisma";
import { AccountsRepository } from "../accountsRepository";
import { prisma } from "@/lib/prisma";

export class AccountsPrismaRepository implements AccountsRepository {
   async  create(data: Prisma.AccountUncheckedCreateInput) {
        const account = await prisma.account.create({
            data:{
                name:data.name,
                userId:data.userId
            }
        })

        return account;
    }
    async findByName(name: string, userId:string): Promise<Account | null> {
       const account = prisma.account.findFirst({
            where: {
                userId,
                name
            }
       })

       return account;
    }

}