import { TransactionsRepository } from '@/repositories/transactionsRepository';
import { NoPDFFileError } from '../errors/noPdfFile';
import { readPDF } from '@/utils/pdfReader';
import { RequiredResource } from '../errors/requiredResource';


interface SaveItauTransactionsExecuteRequest {
    data: Buffer<ArrayBufferLike> | null;
    accountId: string;
    userId: string;
}

export class SaveItauTransactionsUseCase {
    constructor(private readonly transactionRepository:TransactionsRepository) {}
    
    async execute({ data, accountId, userId }: SaveItauTransactionsExecuteRequest) {

        if (!data) throw new NoPDFFileError();
        
        if(!accountId) throw new RequiredResource('accountId')

        const parsedTransactions  = await readPDF(data);
        
        const createdTransactions = await Promise.all(
            parsedTransactions.map(record => {
              return this.transactionRepository.create({
                amount: Number(record.amount),
                date: new Date(record.date),
                description: record.description,
                type: record.type,
                accountId,
                userId,
              })
            })
          )
      
        return { transactions: createdTransactions }

    }


}
