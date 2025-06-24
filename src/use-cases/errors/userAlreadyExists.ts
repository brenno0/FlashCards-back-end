export class UserAlreadyExistsError extends Error {
    constructor(){
        super('User already exists. Please try with another e-mail.')
    }
}