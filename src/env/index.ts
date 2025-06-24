import 'dotenv/config'

import { z } from 'zod'

const envSchema = z.object({
    NODE_ENV:z.enum(['dev', 'test', 'production']),
    PORT:z.coerce.number().default(3333)
})

const _env = envSchema.safeParse(process.env);

if(_env.success === false)  throw new Error(`Invalid variables \n. ${_env.error.format()._errors}`)

export const env = _env.data