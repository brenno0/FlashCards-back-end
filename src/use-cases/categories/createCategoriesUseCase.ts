import { CategoriesRepository } from "@/repositories/categoriesRepository";
import { CategoryAlreadyExistsError } from "../errors/categoryAlreadyExists";

interface CreateCategoriesUseCaseRequest {
    name:string;
}

export class CreateCategoriesUseCase {
    constructor(private readonly categoriesRepository:CategoriesRepository){}

   async execute({ name }: CreateCategoriesUseCaseRequest) {
        const categoryAlreadyExists = await this.categoriesRepository.findByName(name)
        
        if(categoryAlreadyExists) throw new CategoryAlreadyExistsError();

        const category = await this.categoriesRepository.create({
            name
        })

        return { category }
    }
    
}