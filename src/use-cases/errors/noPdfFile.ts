export class NoPDFFileError extends Error {
    constructor() {
        super('No such PDF file. Please send any to proceed.');
    }
}
