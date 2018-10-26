import { Message } from "./";

export enum ResponseStatusType {
    OK = "OK",
    Failure = "Failure"
}
export class ResponseStatus {
    constructor(init?: any) {
        if (init) {
            this.Type = <ResponseStatusType>init.Type;
            this.Message = init.Message;
            this.Date = new Date(init.Date);
        }
    }
    public Type: ResponseStatusType = ResponseStatusType.OK;
    public Message?: Message;
    public Date?: Date;
}