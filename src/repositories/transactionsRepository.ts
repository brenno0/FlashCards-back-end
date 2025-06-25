import { Prisma, Transaction, TransactionType } from "generated/prisma";

export interface SearchManyTransactionsParams {
    accountId?:string;
    amount?:string;
    startDate?:Date;
    finalDate?:Date;
    description?:string;
    id?:string;
    type?:TransactionType
}

export interface TransactionsRepository {
    create(data: Prisma.TransactionUncheckedCreateInput):Promise<Transaction>
    searchMany(query: SearchManyTransactionsParams, userId:string):Promise<Transaction[]>
}