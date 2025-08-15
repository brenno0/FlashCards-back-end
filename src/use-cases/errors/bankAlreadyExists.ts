export class BankAlreadyExistsError extends Error {
    constructor() {
        super('Bank already exists.');
    }
}
