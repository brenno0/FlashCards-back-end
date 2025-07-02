import { CategoriesPrismaRepository } from "@/repositories/prisma/categoroes.repository.prisma";
import { CreateCategoriesUseCase } from "@/use-cases/categories/createCategoriesUseCase";
import { CategoryAlreadyExistsError } from "@/use-cases/errors/categoryAlreadyExists";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from 'zod';

export const createCategories = async (request:FastifyRequest,reply:FastifyReply) => {
    try{
        const categoriesRepository = new CategoriesPrismaRepository();

        const createCategoriesUseCase = new CreateCategoriesUseCase(categoriesRepository);
        
        const categoryBodySchema = z.object({
            name:z.string(),
        })

        const { name } = categoryBodySchema.parse(request.body)

        const { category } = await createCategoriesUseCase.execute({
            name,
        });

        reply.status(201).send(category)
      
    }catch(error) {
      if(error instanceof CategoryAlreadyExistsError) return reply.status(400).send({ message: error.message, error:'CategoryAlreadyExistsError' });
    }
}