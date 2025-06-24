import { Category, Prisma } from "generated/prisma";

export interface CategoriesRepository {
    create(data: Prisma.CategoryCreateInput):Promise<Category>
    findByName(name:string): Promise<Category | null>;
}