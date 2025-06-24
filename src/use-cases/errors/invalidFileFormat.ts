export class InvalidFileFormat extends Error {
    constructor() {
        super('Please send a valid file format')
    }
}