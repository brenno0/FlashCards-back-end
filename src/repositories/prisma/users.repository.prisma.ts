import { Prisma, User } from "generated/prisma";
import { prisma } from "@/lib/prisma";
import { UsersRepository } from "../usersRepository";

export class UsersPrismaRepository implements UsersRepository {
    async findByEmail(email: string): Promise<User | null> {
        const user = await prisma.user.findUnique({
             where: {
                email
            }
        })

        return user;
    }

    async create(data: Prisma.UserCreateInput): Promise<User> {
        const user = await prisma.user.create({ data })
        
        return user;
    }
}