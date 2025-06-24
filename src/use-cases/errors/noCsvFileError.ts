
export class NoCSVFileError extends Error {
    constructor() {
        super('No such CSV file. Please send any to proceed.')
    }
}