import { ApiTokensPrismaRepository } from '@/repositories/prisma/api-tokens.repository.prisma';

import { AuthenticateApiTokenUseCase } from '../api-tokens/authenticate-api-token-use-case';
import { CreateApiTokenUseCase } from '../api-tokens/create-api-token-use-case';
import { DeleteApiTokenUseCase } from '../api-tokens/delete-api-token-use-case';
import { GetApiTokensUseCase } from '../api-tokens/get-api-tokens-use-case';

export const makeApiTokens = () => {
  const apiTokensRepository = new ApiTokensPrismaRepository();
  return {
    createApiTokenUseCase: new CreateApiTokenUseCase(apiTokensRepository),
    getApiTokensUseCase: new GetApiTokensUseCase(apiTokensRepository),
    deleteApiTokenUseCase: new DeleteApiTokenUseCase(apiTokensRepository),
    authenticateApiTokenUseCase: new AuthenticateApiTokenUseCase(
      apiTokensRepository,
    ),
  };
};
