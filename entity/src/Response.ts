import { Message, ResponseStatus, ResponseStatusType } from ".";


export class Response {
    constructor(init?: any) {
		if (init) {
			this.Status = new ResponseStatus(init.Status);
			this.Result = init.Result;
		}
		else {
			this.Status = new ResponseStatus({ Type: "OK" });
		}
    }
	public Status: ResponseStatus;
    public Result: any;
}