import { InvalidFileFormat } from "@/use-cases/errors/invalidFileFormat";
import { NoCSVFileError } from "@/use-cases/errors/noCsvFileError";
import { makeNubankBilling } from "@/use-cases/factories/make-load-nubank-billing";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from 'zod';

export const loadNubankBilling = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const parts = request.parts()

    let file = null
    let accountId: string | null = null

    for await (const part of parts) {
      if (part.type === 'file') {
        file = part
      } else if (part.type === 'field' && part.fieldname === 'accountId') {
        accountId = part.value as string | null
      }
    }

    if (!file) throw new NoCSVFileError()

    const transactionBodySchema = z.object({
      accountId: z.string().min(1),
    })

    const validatedFields = transactionBodySchema.parse({ accountId })

    const saveNubankTransactionsUseCase = makeNubankBilling()
    const userId = request.user.sub

    const { records } = await saveNubankTransactionsUseCase.execute({
      data: file,
      userId,
      accountId: validatedFields.accountId
    })

    return reply.send({ message: 'CSV parsed successfully', data: records })
  } catch (error) {
    if (error instanceof NoCSVFileError) return reply.status(400).send({ error: error.message })
    if (error instanceof InvalidFileFormat) return reply.status(415).send({ error: error.message })

    return reply.status(500).send({ error: 'Internal server error' })
  }
}
