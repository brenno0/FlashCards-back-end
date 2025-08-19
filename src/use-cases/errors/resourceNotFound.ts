export class ResourceNotFoundError extends Error {
  constructor({ resource }: { resource: string }) {
    super(`${resource} não encontrado`);
  }
}
