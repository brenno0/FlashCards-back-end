import { FastifyInstance } from "fastify"
import { loadNubankBilling } from "./controllers/importStatement.controller"
import { createUser } from "./controllers/auth.controller"

export const appRoutes = async (app:FastifyInstance) => {
    app.post('/import-statement', loadNubankBilling)
    app.post('/auth/sign-up', createUser)
}