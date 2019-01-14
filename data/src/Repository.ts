import { Type } from "@lmstudios/types";
import * as Schema from "@lmstudios/schema";
import { Context } from "./Context";
import { Model } from "./Model";
import { ChangeStatus } from "./ChangeTracker";

export class Repository<TModel extends Model> {
	constructor(context:Context, model: (new (...args: any[]) => TModel)) {
        this.Context = context;
        var modelSchema = undefined;
        var modelType = Type.GetType(model);
        if (modelType !== undefined)
            modelSchema = context.Schema.Models.find(x => { return x.Type === modelType});
        if (modelSchema === undefined)
            throw new Error(``);
        this.ModelSchema = modelSchema;
    }
    
    public GetType():Type{
        var result = Type.GetType((<any>this).prototype);
        if (result !== undefined)
            return result;
        throw new Error(``);
    }
	private __items:TModel[] = [];
	public get Items():TModel[]{
		return this.__items;
	}
	public *[Symbol.iterator]() {
		for (const value of this.Items) {
			yield value;
		}
	}
    public Context:Context;
    public ModelSchema:Schema.Model;
	public Name:string = "";

    public Local: LocalRepository<TModel> = new LocalRepository(this);
	public Server: ServerRepository<TModel> = new ServerRepository(this);

	public Create():TModel{
        if (this.ModelSchema.Type.Constructor !== undefined)
            return new this.ModelSchema.Type.Constructor(this.Context);
		throw new Error(``);
	}
	public Add(value?:TModel|Partial<TModel>, fromServer?:boolean):TModel{	
        let result:TModel|undefined;	
        if (value === undefined){
            result = this.Add({});
        }
        else if (value instanceof Model){
            if (this.ModelSchema.Type !== value.GetType())
                throw new Error(``);
            result = this.Items.find(x => { return x === value });
            if (result === undefined){
                result = value;
                this.Items.push(result);
                if (result.__controller.Status.Change.Model === ChangeStatus.Detached)
                    result.__controller.Status.Change.Model = ChangeStatus.Added;                
            }
        }	
        else {
            result = this.Local.Select(value);
            if (result === undefined){
                result = this.Create();
                result.Load(value, fromServer);
                result = this.Add(result, fromServer);
            }
        }
		return result;
	}
	public Remove(value:TModel){		
		var index = this.Items.indexOf(value);
		if (index >= 0)
			this.Items.splice(index, 1);
	}

	public async Select(value:Partial<TModel>):Promise<TModel|undefined> {
		var result = this.Local.Select(value);
		if (!result)
			result = await this.Server.Select(value);
		return result;
	}
	public async Search(...values:any[]):Promise<TModel[]>{
		if (values === undefined || values.length === 0)
			return [];
		if (values.length === 1 && Array.isArray(values[0]))
			values = values[0];

		await this.Server.Search(...values);
		return this.Local.Search(...values);
	}
}
export class LocalRepository<TModel extends Model> {
    constructor(repository: Repository<TModel>) {
        this.Repository = repository;
    }
	public Repository: Repository<TModel>;
	public get Items():TModel[]{
		return this.Repository.Items;
	}

    public Select(value:Partial<TModel>) : TModel|undefined {				
        var filters:Array<Partial<TModel>> = [];
        for (let key of this.Repository.ModelSchema.Keys){
            var filter:Partial<TModel>|undefined = {};
            for (let property of key.Properties){
                if (property.GetValue(value) === undefined){
                    filter = undefined;
                    break;
                }
                property.SetValue(filter, property.GetValue(value));
            }
            if (filter !== undefined){
                var localResults = this.Search(filter);
                if (localResults.length == 1)
                    return localResults[0];
            }
        }
		return undefined;
	}
	public Search(...values:any[]):TModel[]{
		var results:TModel[] = [];
		for (let value of values){
			for (let item of this.Repository.Items){
				var include = true;
				for (var key in value){
					var property = this.Repository.ModelSchema.GetProperty(key);
					if (property !== undefined){
						if (property.GetValue(item) !== property.GetValue(value))
							include = false;
					}	
				}
				if (include){
					var included = results.find(x => { return (x === item); });
					if (!included)
						results.push(item);									
				}	
			}			
		}
		return results;
	}
}
export class ServerRepository<TModel extends Model> {
    constructor(repository: Repository<TModel>) {
        this.Repository = repository;
    }
	public Repository: Repository<TModel>;
	public async Select(value: Partial<TModel>) : Promise<TModel|undefined> {
		var body = {
			Type: this.Repository.ModelSchema.Type.FullName,
			Value: value
        };
        var response = await this.Repository.Context.API.Post("Model/Select", body);
        if (response !== undefined){
            try {
                var responseResult = await response.json();
                if (responseResult !== undefined && responseResult.Result !== undefined)
                    this.Repository.Context.Load(responseResult.Result);
            }
            catch {
                console.warn("Select returned non json")
            }
        }
        return this.Repository.Local.Select(value);
	}
	public async Search(...values:any[]):Promise<TModel[]>{
		var body = {
			Type: this.Repository.ModelSchema.Type.FullName,
			Values:values
        }
        var response = await this.Repository.Context.API.Post("Model/Search", body);
        if (response !== undefined){
            try {
                var responseResult = await response.json();
                if (responseResult !== undefined && responseResult.Result !== undefined)
                    this.Repository.Context.Load(responseResult.Result);
            }
            catch {
                console.warn("Search returned non json")
            }
        }
		return this.Repository.Local.Search(...values);
	}
}