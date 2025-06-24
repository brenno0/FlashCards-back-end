import { UsersPrismaRepository } from "@/repositories/prisma/users.repository.prisma";
import { UserAlreadyExistsError } from "@/use-cases/errors/userAlreadyExists";
import { CreateUsersUseCase } from "@/use-cases/users/createUsersUseCase";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from 'zod';

export const createUser = async (request:FastifyRequest,reply:FastifyReply) => {
    try {
        const usersRepository = new UsersPrismaRepository()
        const createUserUseCase = new CreateUsersUseCase(usersRepository)
        
        const registerBodySchema = z.object({
            name:z.string(),
            email:z.string().email("Por favor insira um e-mail válido"),
            password:z.string().min(6)
        })
        const { name, email, password } = registerBodySchema.parse(request.body);
        
        const { user } = await createUserUseCase.execute({
            name,
            email,
            password,
        })

        return reply.status(201).send(user);
    }catch(error) {
        if(error instanceof UserAlreadyExistsError) reply.status(400).send({ message:error.message })
    }
}