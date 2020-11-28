export class DomainException {
    
    readonly response;

    constructor(response: string | Record<string, any>) {
        this.response = response;
    }

}