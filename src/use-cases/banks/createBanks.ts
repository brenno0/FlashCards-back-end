import { BanksRepository } from "@/repositories/banksRepository";
import { BankAlreadyExistsError } from "../errors/bankAlreadyExists";

interface CreateBanksUseCaseRequest {
    name: string;
    imageUrl?:string;
}
export class CreateBanksUseCase {
    constructor(private readonly banksRepository:BanksRepository) {}
    
    async execute({ name, imageUrl }: CreateBanksUseCaseRequest) {
        const bankAlreadyExists = await this.banksRepository.findByName(name)
        if(bankAlreadyExists) throw new BankAlreadyExistsError()

        const bank = await this.banksRepository.create({
            name,
            imageUrl,
        })

        return { bank }
    }
}