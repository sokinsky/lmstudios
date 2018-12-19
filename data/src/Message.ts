console.log("LMS.Data.Message");


export enum MessageType {
    OK = "OK",
    Invalid = "Invalid",
    Unauthorized = "Unauthorized"
}
export class Message {
    public Type: MessageType = MessageType.OK;
    public Name?: string;
    public Description?: string;
    public InnerMessages?: Array<Message>;
}