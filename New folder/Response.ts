import { Message, Request, ResponseStatus } from ".";


export class Response {
    constructor(init?: any) {
		this.Status = ResponseStatus.OK;
		if (init) {
			this.Status = init.Status
			this.Message = init.Message;
			this.Description = init.Description;
			this.Result = init.Result;
		}
	}
	public Request?:Request;
	public Status: ResponseStatus;
	public Message: string = "";
	public Description: string = "";
    public Result: any;
}