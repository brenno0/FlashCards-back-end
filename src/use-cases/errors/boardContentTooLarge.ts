export class BoardContentTooLargeError extends Error {
  constructor(maxBytes: number) {
    super(`Conteúdo do quadro excede ${maxBytes} bytes`);
  }
}
