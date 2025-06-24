import { Prisma, Category } from "generated/prisma";
import { CategoriesRepository } from "../categoriesRepository";
import { prisma } from "@/lib/prisma";

export class CategoriesPrismaRepository implements CategoriesRepository {
    async findByName(name: string): Promise<Category | null> {
        const category = await prisma.category.findUnique({ 
            where:{ name }
        })
        
        return category;
    }
    async create(data: Prisma.CategoryCreateInput): Promise<Category> {
        const category = await prisma.category.create({ data })

        return category;
    }

}