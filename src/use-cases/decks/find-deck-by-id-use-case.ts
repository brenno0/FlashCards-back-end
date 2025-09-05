import type { DecksRepository } from '@/repositories/decks-repository';

import { ResourceNotFoundError } from '../errors/resourceNotFound';

export class GetDeckByIdUseCase {
  constructor(private readonly decksRepository: DecksRepository) {}

  async handle({ deckId }: { deckId: string }) {
    const deck = await this.decksRepository.getById({
      deckId,
    });

    if (!deck) {
      throw new ResourceNotFoundError({ resource: 'Deck' });
    }

    return { deck };
  }
}
