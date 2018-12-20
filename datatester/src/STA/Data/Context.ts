import { Injectable, Inject, InjectionToken} from "@angular/core";
import { Schema, Context as Base, Repository, Decorators } from "@lmstudios/data";
import { Models } from "./";
import { appSettings } from "../../Configuration/appSettings"

@Injectable()
export class ContextService {
    public Url:string = "";
    public Schema?:any = {};
    public Models:{ID:string,Type:string,Value:any}[] =[];

    constructor(){}
    public async Initialize():Promise<any>{
        let input = { method: "POST", body: "{}" }        
        let url = appSettings.apiUrl + "/Context/Schema";
        let fetchResult = await fetch(url, input);
        let fetchResponse = await fetchResult.json();

        this.Url = appSettings.apiUrl,
        this.Schema = fetchResponse.Result;

        var result:any = {
            Url:appSettings.apiUrl,
            Schema:fetchResponse.Result
        }
        return result;    
    }
}
@Injectable({ providedIn: "root" })
@Decorators.Context("STA.Data.Context")
export class Context extends Base {
    constructor(public service:ContextService){
        super(service.Url, service.Schema);
    }
    public Emails = new Repository(this, Models.Email);
    public People = new Repository(this, Models.Person);
    public Users = new Repository(this, Models.User);
    public PeopleEmails = new Repository(this, Models.PersonEmail);
}
