export class ResourceAlreadyExists extends Error {
  constructor({ resource }: { resource: string }) {
    super(`${resource} já existe.`);
  }
}
