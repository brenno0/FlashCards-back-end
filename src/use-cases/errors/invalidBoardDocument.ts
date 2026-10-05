export class InvalidBoardDocumentError extends Error {
  constructor(reason: string) {
    super(`Conteúdo do quadro inválido: ${reason}`);
  }
}
