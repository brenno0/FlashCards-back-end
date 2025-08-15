export class ResourceNotFoundError extends Error {
    constructor({ resource }: { resource: string }) {
        super(`${resource} not found`);
    }
}
