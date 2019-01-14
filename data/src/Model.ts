import { Type, TypeDecorator, Property } from "@lmstudios/types";
import * as Schema from "@lmstudios/schema";
import { Context } from "./Context";
import { Controller } from "./Controller";


@TypeDecorator("LMS.Data.Model")
export class Model {
	constructor(context:Context, data?:Partial<Model>)	{
        this.__context = context;
		this.__type = ((<any>this).__proto__).type;	

		var proxy:Model|undefined = new Proxy(this, {
			get: (target, propertyName: string, reciever) => {
				let property:Property|undefined = this.GetType().GetProperty(propertyName);
				if (property === undefined)
					return Reflect.get(target, propertyName, reciever);
				return this.__controller.GetValue(property);
			},
			set: (target, propertyName:string, propertyValue, reciever) => {
				let property:Property|undefined = this.GetType().GetProperty(propertyName);
				if (property !== undefined){
					this.__controller.SetValue(property, propertyValue);
					return true;
				}
				return true;
			}
		});
		this.Server = <any>new Proxy(this, {
			get: async (target, propertyName: string, reciever) => {
				let property:Property|undefined = this.GetType().GetProperty(propertyName);
				if (property === undefined)
					return Reflect.get(target, propertyName, reciever);
				return this.__controller.GetValueAsync(property);
			}
		});
	 	var createController = ((<any>this).__proto__).modelController;
	 	if (createController !== undefined)
	 		this.__controller = new (createController())(context, this, proxy);	
	 	else
			 this.__controller = new Controller(context, this, proxy);
	 	return proxy;
    }
    
    public __context:Context;
    public __type:Type;
    public __controller:Controller<Model>;
    public Server:{[p in keyof this]:Promise<this[p]>};

    
    public GetType():Type{
        return this.__type;
    }
    public GetSchema():Schema.Model{
        var result = this.__context.Schema.Models.find(x => { return x.Type === this.GetType()});
        if (result !== undefined)
            return result;
        throw new Error(`Model.GetSchema():Unable to find Schema`);
    }
 


	public Delete(){
		var repository = this.__controller.Context.GetRepository(this.GetSchema());
		repository.Remove(this);
	}
	public Load(value:any, server?:boolean){
		this.__controller.Load(value, server);
	}
	public GetValue(property:string|Property){
		return this.__controller.GetValue(property);
	}
	public SetValue(property:string|Property, value:any){
		this.__controller.SetValue(property, value);
	}
	public toString():string{
		return this.__controller.toString();
	}
	public toJson():string{
		return JSON.stringify(this.__controller.Values.Local, null, "\t");
	}
	public Undo(property?:string|Property){
		this.__controller.Undo(property);

	}

	public Validate(){
		this.__controller.Validate();
	}
	public async Duplicate():Promise<Model|undefined>{
		return this.__controller.Duplicate();
	}
}



