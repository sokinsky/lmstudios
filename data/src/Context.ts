import { Type } from "@lmstudios/types";
import * as Schema from "@lmstudios/schema";

import { API } from "./API";
import { ChangeTracker } from "./ChangeTracker";
import { Model } from "./Model";
import { Repository } from "./Repository";

export class Context {
	constructor() {
        // console.log(apiDomain);
        // this.API = new API(apiDomain);
        // this.API = new API('');
        // this.Schema = new Schema.Context({});
		// this.Schema = new Schema.Context(schemaData);
		var proxy:Context = new Proxy(this, {
			set: (target, propertyName:string, propertyValue, reciever) => {
				if (propertyValue instanceof Repository){
					propertyValue.Name = propertyName;
					if (this.Repositories.find(x => { return x === propertyValue}) === undefined) {
						this.Repositories.push(propertyValue);
					}
						
				}					
				return Reflect.set(target, propertyName, propertyValue, reciever);
			}
		});
		//this.Initialize();
        return proxy;
        console.log("here");
    }
    
	public API:API = new API('');
	public Tracker:ChangeTracker = new ChangeTracker(this);
	public Schema:Schema.Context = new Schema.Context({});

	public Repositories:Repository<Model>[] = [];
	public async Initialize(){
        var response = await this.API.Post("Model/Search", {});
        if (response !== undefined){
            try {
                var responseResult = await response.json();
                if (responseResult !== undefined && responseResult.Result !== undefined)
                    this.Load(responseResult.Result);
            }
            catch {
                console.warn("Initialize returned non json")
            }
        }
	}
	public GetRepository(type:string|Type|Schema.Model|Model|(new (...args: any[]) => Model)):Repository<Model> {
        var result:Repository<Model>|undefined;
		switch (typeof(type)){
			case "string":
				result = this.Repositories.find(x => { return x.ModelSchema.Type.FullName == <string>type });					
            case "object":
				if (type instanceof Model)
                    result = this.Repositories.find(x => { return x.ModelSchema === (<Model>type).GetSchema()});
                else if (type instanceof Type)
                    result = this.Repositories.find(x => { return x.ModelSchema.Type === type; })
				else if (type instanceof Schema.Model )
					result = this.Repositories.find(x => { return x.ModelSchema === type; });
				break;
			case "function":
				result = this.Repositories.find(x => { return x.ModelSchema.Type.Constructor === type; });
    			break;
        }
        if (result !== undefined)
            return result;
		throw new Error(``);
	}

	public async Load(models: {ID:string,Type:string,Value:any}[], fromServer?:boolean) {	
		models.forEach((bridgeModel: any) => {
			var dataModel = undefined;
			var dataEntry = this.Tracker.Entries.find(x => x.Model.__controller.ID === bridgeModel.ID);
			if (dataEntry !== undefined)
				dataModel = dataEntry.Model;
			if (dataModel === undefined){
				var dataRepository = this.GetRepository(bridgeModel.Type);
				dataModel = dataRepository.Local.Select(bridgeModel.Value);
				if (dataModel === undefined)
					dataModel = dataRepository.Add(bridgeModel.Value, true);	
				else
					dataModel.Load(bridgeModel.Value, true);	
			}
			else{
				dataModel.Load(bridgeModel.Value, true);
			}							
		});
	}
	public async SaveChanges(): Promise<boolean> {
        let bridgeModels: any[] = this.Tracker.GetBridgeChanges();
        var response = await this.API.Post("Context/SaveChanges", bridgeModels);
        if (response !== undefined){
            try {
                var responseResult = await response.json();
                if (responseResult !== undefined && responseResult.Result !== undefined)
                    this.Load(responseResult.Result);
            }
            catch {
                console.warn("Initialize returned non json")
            }
        }	
		return true;
	}
}

