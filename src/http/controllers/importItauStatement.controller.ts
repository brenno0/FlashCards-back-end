import { NoPDFFileError } from '@/use-cases/errors/noPdfFile'
import { RequiredResource } from '@/use-cases/errors/requiredResource'
import { makeImportItauStatement } from '@/use-cases/factories/make-import-itau-statement'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export const importItauStatement = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const saveItauTransactionsUseCase = makeImportItauStatement()
    const parts = request.parts()
  
    let buffer: Buffer | null = null
    let accountId: string | null = null
  
    for await (const part of parts) {
      if (part.type === 'file') {
        buffer = await part.toBuffer()
      } else if (part.type === 'field') {
  
        if (part.fieldname === 'accountId') {
          accountId = part.value as string | null
        }
      }
    }
    const validatedAccountId = z.string().min(1).parse(accountId)
    const { sub: userId } = request.user
  
    const transactions = await saveItauTransactionsUseCase.execute({
      data: buffer,
      userId,
      accountId: validatedAccountId,
    })
  
    reply.status(201).send({ transactions })
  }catch(error) {
    if (error instanceof NoPDFFileError) return reply.status(400).send({ message: error.message, error:'NoPDFFileError'})
    if (error instanceof RequiredResource)  return reply.status(400).send({ message: error.message, error:'RequiredResource' })
  }
}
