import type { DecksRepository } from '@/repositories/decks-repository';

import { ResourceNotFoundError } from '../errors/resourceNotFound';

export class DeleteDeckByIdUseCase {
  constructor(private readonly decksRepository: DecksRepository) {}

  async handle({ deckId }: { deckId: string }) {
    const deck = await this.decksRepository.getById({
      deckId,
    });

    if (!deck?.id) {
      throw new ResourceNotFoundError({ resource: 'Deck' });
    }

    await this.decksRepository.delete({ deckId });
  }
}
