import type { DecksRepository } from '@/repositories/decks-repository';
import type { FoldersRepository } from '@/repositories/folders-repository';
import type { Prisma } from 'generated/prisma';

import { ResourceNotFoundError } from '../errors/resourceNotFound';
import { assertFolderTarget } from '../folders/assert-folder-target';

interface UpdateDeckUseCaseRequest {
  data: Prisma.DeckUpdateInput;
  deckId: string;
  userId: string;
  /** `null` moves the deck out of any folder; `undefined` leaves it where it is. */
  folderId?: string | null;
}

export class UpdateDeckUseCase {
  constructor(
    private readonly decksRepository: DecksRepository,
    private readonly foldersRepository: FoldersRepository,
  ) {}

  async handle({ data, deckId, userId, folderId }: UpdateDeckUseCaseRequest) {
    const deck = await this.decksRepository.getById({ deckId, userId });

    if (!deck) {
      throw new ResourceNotFoundError({ resource: 'Deck' });
    }

    await assertFolderTarget(this.foldersRepository, {
      folderId,
      userId,
      kind: 'DECK',
    });

    const updatedDeck = await this.decksRepository.update({
      data: {
        ...data,
        ...(folderId !== undefined
          ? {
              folder: folderId
                ? { connect: { id: folderId } }
                : { disconnect: true },
            }
          : {}),
      },
      deckId,
    });

    return {
      updatedDeck,
    };
  }
}
