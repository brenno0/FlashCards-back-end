import { app } from "./app";
import { env } from "./env";
import multipart from '@fastify/multipart';
import { loadBilling } from "./http/controllers/importStatement.controller";
import { prisma } from "./lib/prisma";


app.decorate('prisma', prisma);

app.register(multipart);
app.register(loadBilling)


app.listen({
    port:env.PORT,
    host:'0.0.0.0'
}).then(() => {
    console.log('Server is running!')
})