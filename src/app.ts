import { fastify } from 'fastify'
import { appRoutes } from './http/routes';
import { prisma } from './lib/prisma';
import multipart from '@fastify/multipart';
import { ZodError } from 'zod';
import { env } from './env';
import fastifyJwt from '@fastify/jwt';
import dotenv from 'dotenv'
import { validatorCompiler, serializerCompiler, ZodTypeProvider, jsonSchemaTransform} from 'fastify-type-provider-zod';
import { fastifySwagger } from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import cors from '@fastify/cors'

export const app = fastify().withTypeProvider<ZodTypeProvider>()
 app.register(cors, {
    allowedHeaders:'*'
  })
  

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(fastifySwagger, {
    openapi: {
        info:{
            title:"BFinnance API",
            version:'1.0.0'
        },
    },
    transform: jsonSchemaTransform
})

app.register(fastifySwaggerUi, {
    routePrefix:"/docs"
})

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