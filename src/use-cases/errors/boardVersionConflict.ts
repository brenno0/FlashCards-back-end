export class BoardVersionConflictError extends Error {
  constructor(public readonly currentVersion: number) {
    super('O quadro foi alterado em outro lugar');
  }
}
