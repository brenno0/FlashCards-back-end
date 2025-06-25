import { NubankCsvRequestDTO } from '@/dtos/transactions/nubankCsv';
import { TransactionsRepository } from '@/repositories/transactionsRepository';
import { MultipartFile } from '@fastify/multipart';
import { parse } from 'csv-parse';
import { NoCSVFileError } from './errors/noCsvFileError';
import { InvalidFileFormat } from './errors/invalidFileFormat';


interface SaveNuBankTransactionsExecuteRequest {
    data: MultipartFile | null;
    accountId: string;
    userId: string;
}

export class SaveNubankTransactionsUseCase {
    constructor(private readonly transactionRepository:TransactionsRepository) {}
    
    async execute({ data, accountId, userId }: SaveNuBankTransactionsExecuteRequest) {

        if (!data) throw new NoCSVFileError();
        if (data.mimetype !== 'text/csv' ) throw new InvalidFileFormat();
        
        const records = await this.parseCsvAndReturnRecords(data)

        records.forEach(async record => {
            const transactionType = record.amount.startsWith('-') ? 'INCOME' : 'EXPENSE'
            await this.transactionRepository.create({
                amount:Number(record.amount),
                date:new Date(record.date),
                description:record.title,
                type: transactionType,
                accountId,
                userId,
            }) 
        })

        return { records }
        

    }

    async parseCsvAndReturnRecords(data:MultipartFile) {

        // Read the CSV file
        const chunks = []      
        for await (const chunk of data.file) {
            chunks.push(chunk)
        }
        
        const csvContent = Buffer.concat(chunks).toString('utf8');
        
        // Transform CSV to JSON
        const records:NubankCsvRequestDTO[] = await new Promise((resolve, reject) => {
            parse(csvContent, {
                columns: true, 
                skip_empty_lines: true,
            }, (err, output) => {
                if (err) reject(err);
                resolve(output);
            });
        });

        return records;
    }
}
