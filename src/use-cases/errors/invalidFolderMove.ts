export class InvalidFolderMoveError extends Error {
  constructor(reason: string) {
    super(`Movimento de pasta inválido: ${reason}`);
  }
}
