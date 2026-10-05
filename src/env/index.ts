import 'dotenv/config';

import { z } from 'zod';

const envSchema = z
  .object({
    NODE_ENV: z.enum(['dev', 'test', 'production']),
    PORT: z.coerce.number().default(3333),
    JWT_SECRET: z.string(),
    STORAGE_DRIVER: z.enum(['local', 'gdrive']).default('local'),
    STORAGE_LOCAL_ROOT: z.string().default('./uploads'),
    GDRIVE_CLIENT_ID: z.string().optional(),
    GDRIVE_CLIENT_SECRET: z.string().optional(),
    GDRIVE_REFRESH_TOKEN: z.string().optional(),
    GDRIVE_FOLDER_ID: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.STORAGE_DRIVER !== 'gdrive') {
      return;
    }
    for (const key of [
      'GDRIVE_CLIENT_ID',
      'GDRIVE_CLIENT_SECRET',
      'GDRIVE_REFRESH_TOKEN',
      'GDRIVE_FOLDER_ID',
    ] as const) {
      if (!value[key]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: `${key} is required when STORAGE_DRIVER=gdrive`,
        });
      }
    }
  });

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
  throw new Error(`Invalid variables \n. ${_env.error.format()._errors}`);
}

export const env = _env.data;
