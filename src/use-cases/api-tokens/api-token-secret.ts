import { createHash, randomBytes } from 'node:crypto';

/** Every personal access token starts with this, so the auth hook can tell it apart from a JWT. */
export const API_TOKEN_PREFIX = 'fct_';

export const hashApiToken = (token: string) =>
  createHash('sha256').update(token).digest('hex');

export const isApiToken = (token: string) => token.startsWith(API_TOKEN_PREFIX);

export const generateApiToken = () => {
  const token = `${API_TOKEN_PREFIX}${randomBytes(32).toString('base64url')}`;
  return {
    token,
    tokenHash: hashApiToken(token),
    // Enough to recognise the token in a list without revealing it.
    prefix: token.slice(0, API_TOKEN_PREFIX.length + 6),
  };
};
