import { SearchManyTransactionsParams, TransactionsRepository } from "@/repositories/transactionsRepository";
import { Transaction } from "generated/prisma";
import { MissingDateParamsError } from "../errors/missingDateParams";

interface GetTransactionsUseCaseRequest {
    params:SearchManyTransactionsParams;
    userId:string;
}

interface GetTransactionsUseCaseResponse {
    transactions: Transaction[];
}


export class GetTransactionsUseCase {
    constructor(private readonly transactionsRepository:TransactionsRepository) {}

    async execute({ params, userId }:GetTransactionsUseCaseRequest):Promise<GetTransactionsUseCaseResponse> {

        const { finalDate, startDate } = params;
        
        const transactions = await this.transactionsRepository.searchMany(params,userId)

        if((finalDate && !startDate) || (!finalDate && startDate)) throw new MissingDateParamsError()
        
        return { transactions };
    }   
}