import { Context, Request, Response, ResponseStatus, ResponseStatusType } from ".";

export class API {
	constructor(context: Context, url: string) {
		this.Context = context;
		this.Url = url;
	}
	public Context: Context;
	public Url: string;
	public Requests:Request[] = [];

	public async Post(request:Request): Promise<Response|undefined> {
		let url: string = `${this.Url}/${request.Path}`;
		let input = {
			method: "POST",
			headers: request.Headers,
			body: JSON.stringify(request.Body)
		}

		let fetchResult = await fetch(url, input);
		let fetchResponse = await fetchResult.json();
		let response: Response = new Response(fetchResponse);
		request.Response = response;
		return response;
	}
	

}