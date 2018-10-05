import { API, Response } from "./";

export class Request{
    constructor(path:string, body:object){
        this.Path = path;
        this.Body = body;
    }
    public Date: Date = new Date();
    public Path:string;
    public Headers:{[name:string]:string} = {"Content-Type":"application/json"};
    public Body: object;
    public Response?: Response;

    public async Post(api:API): Promise<Response>{
        this.Response = await api.Post(this);
        
        if (! this.Response)
            throw new Error("Unable to send request");
        else{
            this.Response.Request = this;
            return this.Response;
        }
            
    }

}