export class MissingDateParamsError extends Error {
    constructor() {
        super('Missing date param, please provide to proceed.')
    }
}