import { Bank, Prisma } from "generated/prisma";

export interface BanksRepository {
    create(data: Prisma.BankCreateInput):Promise<Bank>
    findByName(name:string): Promise<Bank | null>;
}