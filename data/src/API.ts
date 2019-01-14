export class API {
	constructor(domain: string) {
		this.Domain = domain;
	}
    public Domain: string;
    public Responses:Response[] = [];
	public async Post(path:string, body:any): Promise<Response|undefined> {
        var url = `${this.Domain}/${path}`
		let input = {
			method: "POST",
			body: JSON.stringify(body)
		}
        let response = await fetch(url, input);
        try{
            return await response.json();
        }
        catch{
            return undefined; 
        }            

	}

}
