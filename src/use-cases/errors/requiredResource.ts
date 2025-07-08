export class RequiredResource extends Error {
    constructor(resource:string){
        super(`Required resource '${resource}' `)
    }
}