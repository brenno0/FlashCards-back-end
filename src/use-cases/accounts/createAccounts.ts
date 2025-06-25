import { AccountsRepository } from "@/repositories/accountsRepository";
import { AccountAlreadyExistsError } from "../errors/accountAlreadyExists";

interface CreateAccountsUseCaseRequest {
    name: string;
    userId:string;
}

export class CreateAccountsUseCase {
    constructor(private readonly accountsRepository:AccountsRepository) {}
    
    async execute({ name, userId }: CreateAccountsUseCaseRequest) {
        const accountAlreadyExists = await this.accountsRepository.findByName(name, userId)
        
        if(accountAlreadyExists) throw new AccountAlreadyExistsError()

        const account = await this.accountsRepository.create({
            name,
            userId,
        })

        return { account }
    }
}