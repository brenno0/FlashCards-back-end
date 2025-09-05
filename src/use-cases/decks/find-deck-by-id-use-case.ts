import type { DecksRepository } from '@/repositories/decks-repository';

import { ResourceNotFoundError } from '../errors/resourceNotFound';

export class GetDeckByIdUseCase {
  constructor(private readonly decksRepository: DecksRepository) {}

  async handle({ deckId, userId }: { deckId: string; userId: string }) {
    const deck = await this.decksRepository.getById({
      deckId,
      userId,
    });

    if (!deck) {
      throw new ResourceNotFoundError({ resource: 'Deck' });
    }

    return { deck };
  }
}
