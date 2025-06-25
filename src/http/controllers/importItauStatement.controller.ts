import { makeImportItauStatement } from '@/use-cases/factories/make-import-itau-statement'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export const importItauStatement = async (request: FastifyRequest, reply: FastifyReply) => {
  const saveItauTransactionsUseCase = makeImportItauStatement()
  const parts = request.parts()

  let buffer: Buffer | null = null
  let accountId: string | null = null

  for await (const part of parts) {
    if (part.type === 'file') {
      buffer = await part.toBuffer()
    } else if (part.type === 'field') {
      console.log('Campo recebido:', part.fieldname, 'valor:', part.value)

      if (part.fieldname === 'accountId') {
        accountId = part.value as string | null
      }
    }
  }

  if (!buffer) {
    return reply.status(400).send({ error: 'Arquivo não enviado.' })
  }

  if (!accountId) {
    return reply.status(400).send({ error: 'Campo "accountId" é obrigatório no multipart.' })
  }

  const validatedAccountId = z.string().min(1).parse(accountId)
  const { sub: userId } = request.user

  const transactions = await saveItauTransactionsUseCase.execute({
    data: buffer,
    userId,
    accountId: validatedAccountId,
  })

  reply.status(201).send({ transactions })
}
