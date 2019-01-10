import { Context, Request, Response } from ".";

export class API {
	constructor(context: Context, domain: string) {
		this.Context = context;
		this.Domain = domain;
	}
	public Domain:string;
	public Context: Context;
	public get Url(): string{
		return `${this.Domain}/api`
	}
	public Requests:Request[] = [];

	public async Post(request:Request): Promise<Response|undefined> {
		request.Url = `${this.Url}/${request.Path}`;
		let input = {
			method: "POST",
			headers: request.Headers,
			body: JSON.stringify(request.Body)
		}

		let fetchResult = await fetch(request.Url, input);
		if (fetchResult.status >= 200 && fetchResult.status < 300){
			let fetchResponse = await fetchResult.json();
			let response: Response = new Response(fetchResponse);
			request.Response = response;
			this.Requests.push(request);
			return response;
		}

	}

}