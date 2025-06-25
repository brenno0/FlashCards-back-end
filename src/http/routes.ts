import { FastifyInstance } from "fastify"
import { loadNubankBilling } from "./controllers/importStatement.controller"
import { authenticate, createUser } from "./controllers/auth.controller"
import { createBanks } from "./controllers/banks.controller"
import { createCategories } from "./controllers/category.controller"
import { verifyJWT } from "./middlewares/verifyJWT"

export const appRoutes = async (app:FastifyInstance) => {
    app.post('/auth/sign-up', createUser)
    app.post('/auth/sign-in', authenticate)

    /* Authenticated routes */
    app.post('/import-statement', { onRequest:[verifyJWT] }, loadNubankBilling)
    app.post('/banks/create', { onRequest:[verifyJWT] }, createBanks)
    app.post('/categories/create', { onRequest:[verifyJWT] }, createCategories)
}