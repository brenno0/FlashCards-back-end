import { fastify } from 'fastify'
import { appRoutes } from './http/routes';
import { prisma } from './lib/prisma';
import multipart from '@fastify/multipart';
import { ZodError } from 'zod';
import { env } from './env';

export const app = fastify()

app.decorate('prisma', prisma);

app.register(appRoutes)
app.register(multipart);

app.setErrorHandler((error, _request, reply) => {
    if(error instanceof ZodError) return reply.status(400).send({ message:'Validation Error', issues: error.format() })

    if(env.NODE_ENV !== 'production') {
        console.error(error)
    } else {
        // Here we should log to an external tool like Datadog/NewRelic/Sentry 
    }

    return reply.status(500).send({ message: "Internal server error." })
})