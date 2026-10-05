export class RateLimitedError extends Error {
  constructor() {
    super('Muitas requisições, tente novamente em instantes');
  }
}
