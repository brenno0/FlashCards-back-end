import { fastify } from 'fastify'
import { appRoutes } from './http/routes';
import { prisma } from './lib/prisma';
import multipart from '@fastify/multipart';
import { ZodError } from 'zod';
import { env } from './env';
import fastifyJwt from '@fastify/jwt';
import dotenv from 'dotenv'

export const app = fastify()

dotenv.config()
app.decorate('prisma', prisma);

app.register(fastifyJwt, {
    secret: env.JWT_SECRET
})
app.register(multipart);
app.register(appRoutes)



app.setErrorHandler((error, _request, reply) => {
    if(error instanceof ZodError) return reply.status(400).send({ message:'Validation Error', issues: error.format() })

    if(env.NODE_ENV !== 'production') {
        console.error(error)
    } else {
        // Here we should log to an external tool like Datadog/NewRelic/Sentry 
    }

    return reply.status(500).send({ message: "Internal server error." })
})