import { Prisma, Bank } from "generated/prisma";
import { BanksRepository } from "../banksRepository";
import { prisma } from "@/lib/prisma";

export class BanksPrismaRepository implements BanksRepository {
    async findByName(name: string): Promise<Bank | null> {
        const bank = await prisma.bank.findUnique({ 
            where:{ name }
        })
        
        return bank;
    }
    async create(data: Prisma.BankCreateInput): Promise<Bank> {
        const bank = await prisma.bank.create({
            data
        })

        return bank;
    }
    
}