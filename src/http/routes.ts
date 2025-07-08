import { loadNubankBilling } from "./controllers/importNubankStatement.controller"
import { authenticate, createUser } from "./controllers/auth.controller"
import { createBanks } from "./controllers/banks.controller"
import { createCategories } from "./controllers/category.controller"
import { verifyJWT } from "./middlewares/verifyJWT"
import { createAccounts } from "./controllers/accounts.controller"
import { importItauStatement } from "./controllers/importItauStatement.controller"
import { getTransactions } from "./controllers/transactions.controller"
import { FastifyTypedInstance } from "@/@types/fastifyTypes"
import { z } from "zod"
import { optionalDateSchema } from "@/lib/schemas/optionalDateSchema"

export const appRoutes = async (app:FastifyTypedInstance) => {
    app.post('/auth/sign-up', { schema:{
        operationId:'createUser',
        body:z.object({
            name:z.string(),
            email:z.string(),
            password:z.string()
        }),
        
        response: {
           201:z.object({
           createdAt:z.date(),
           id:z.string(),
           name:z.string(),
           email:z.string(),
           password:z.string(),
        }),
        400: z.object({
            error: z.string(),
            message: z.string()
        }),
        }
      
    } }, createUser)
    app.post('/auth/sign-in', { schema:{
        operationId:'authUser',
        body:z.object({
            email:z.string(),
            password:z.string(),
        }),
        response: {
            200: z.object({
                token:z.string()
            }),
            401: z.object({
                error: z.string(),
                message: z.string()
            }),
        }
    } } ,authenticate)

    /* Authenticated routes */

    // Transactions
    app.get('/transactions', { onRequest:[verifyJWT], schema:{
        tags:['Transactions'],
        operationId:'listTransactions',
        description:"Transactions list with optional filters",
        querystring: z.object({
            accountId:z.string().optional(),
            amount:z.string().optional(),
            startDate:optionalDateSchema,
            finalDate:optionalDateSchema,
            description:z.string().optional(),
            id:z.string().optional(),
            type:z.enum(['INCOME','EXPENSE']).optional()
        }),
        response:{
            200:z.array(z.object({
                accountId:z.string(),
                amount:z.number(),
                categoryId:z.string().nullable(),
                date:z.date(),
                description:z.string(),
                id:z.string(),
                type: z.enum(['INCOME','EXPENSE'])
            })),
            500:  z.object({
                error: z.string().optional(),
                message: z.string()
            }),
            400: z.object({
                error: z.string(),
                message: z.string()
            }) 
        }
    } }, getTransactions)
    app.post('/import-statement/nubank', { onRequest:[verifyJWT], schema:{
        tags:['Import Statement'],
        operationId:'importNubankStatement',
        description:"Nubank file statement import",
        body: z.object({
            accountId:z.string().nonempty(),
            file:z.instanceof(File)
        }),

        response: {
            200:z.array(z.object({
                    accountId:z.string(),
                    amount:z.number(),
                    category:z.string(),
                    date:z.date(),
                    description:z.string(),
                    id:z.string(),
                    type: z.enum(['INCOME','EXPENSE'])
            })),
            400: z.object({
                error: z.string(),
                message: z.string()
            }),
            415: z.object({
                error: z.string(),
                message: z.string()
            }),
            500:z.object({
                message:z.string()
            })
              
        }
    } }, loadNubankBilling)
    
    app.post('/import-statement/itau', { onRequest:[verifyJWT], schema: {
        tags:['Import Statement'],
        operationId:'importItauStatement',
        description:"Nubank file statement import",
        body: z.object({
            accountId:z.string().nonempty(),
            error: z.string(),
            message: z.string()
        }),

        response: {
            200:z.array(z.object({
                    accountId:z.string(),
                    amount:z.number(),
                    category:z.string(),
                    date:z.date(),
                    description:z.string(),
                    id:z.string(),
                    type: z.enum(['INCOME','EXPENSE'])
            })),
            400: z.object({
                message:z.string()
            }),
            
        }
    } }, importItauStatement)

    
    // Banks
    app.post('/banks/create', { onRequest:[verifyJWT], schema: {
        operationId:'createBank',
        body:z.object({
            name: z.string(),
            imageUrl:z.string().optional(),
        }),
        response: {
            201:z.object({
                id:z.string(),
                imageUrl:z.string(),
                name:z.string()
            }),
            400: z.object({
                error: z.string(),
                message: z.string()
            }),
        }
    } }, createBanks)
    
    // Categories
    app.post('/categories/create', { onRequest:[verifyJWT], schema:{
        operationId:'createCategory',
        body:z.object({
            name:z.string(),
        }),
        response: {
            201:z.object({
                id:z.string(),
                name:z.string()
            }),
            400: z.object({
                error: z.string(),
                message: z.string()
            }),
        }
    } }, createCategories)
    
    // Accounts
    app.post('/accounts/create', { onRequest:[verifyJWT], schema: {
        operationId:'createTransactionAccount',
        body:z.object({
            userId:z.string(),
            name:z.string()
        }),
        400: z.object({
            error: z.string(),
            message: z.string()
        }),
    } }, createAccounts)
}