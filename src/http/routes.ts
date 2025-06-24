import { FastifyInstance } from "fastify"
import { loadNubankBilling } from "./controllers/importStatement.controller"
import { authenticate, createUser } from "./controllers/auth.controller"
import { createBanks } from "./controllers/banks.controller"

export const appRoutes = async (app:FastifyInstance) => {
    app.post('/import-statement', loadNubankBilling)
    app.post('/auth/sign-up', createUser)
    app.post('/auth/sign-in', authenticate)
    app.post('/banks/create', createBanks)
}