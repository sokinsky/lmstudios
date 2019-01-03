import { Schema, Decorators, Context, Controller } from "./";

export class Model {
	constructor(context:Context, data?:Partial<Model>)	{
		this.__context = context;
	
	 	var schemaName = ((<any>this).__proto__).model.FullName;
	 	var schema = this.__context.Schema.Models.find(x => x.FullName === schemaName);
	 	if (schema === undefined)
	 		throw new Error(`Model.constructor():Invalid Schema(${schemaName})`);
	 	this.__schema = schema;				

		var proxy:Model|undefined = new Proxy(this, {
			get: (target, propertyName: string, reciever) => {
				let property:Schema.Property|undefined = this.GetSchema().GetProperty(propertyName);
				if (property === undefined)
					return Reflect.get(target, propertyName, reciever);
				return this.__controller.GetValue(property);
			},
			set: (target, propertyName:string, propertyValue, reciever) => {
				let property:Schema.Property|undefined = this.GetSchema().GetProperty(propertyName);
				if (property !== undefined){
					this.__controller.SetValue(property, propertyValue);
					return true;
				}
				return true;
			}
		});
		this.Server = <any>new Proxy(this, {
			get: async (target, propertyName: string, reciever) => {
				let property:Schema.Property|undefined = this.GetSchema().GetProperty(propertyName);
				if (property === undefined)
					return Reflect.get(target, propertyName, reciever);
				return this.__controller.GetValueAsync(property);
			}
		});
	 	var createController = ((<any>this).__proto__).model.Controller;
	 	if (createController !== undefined)
	 		this.__controller = new (createController())(context, this, proxy);	
	 	else
			 this.__controller = new Controller(context, this, proxy);
		if (this.__controller.Schema.PrimaryKey.Properties.length === 1)
			this.__controller.Schema.PrimaryKey.Properties[0].SetValue(this.__controller.Values.Actual.Data, this.__controller.ID);
	 	return proxy;
	}
	public __context:Context;
	public __schema:Schema.Model;
	public __controller:Controller<Model>
	public Server:{[p in keyof this]:Promise<this[p]>};

	public GetSchema(): Schema.Model{
		return this.__schema;
	}
	// public ToBridge():{ID:string, Type:string, Value:any}{
	// 	return {
	// 		ID:this.__controller.ID,
	// 		Type:this.GetSchema().FullName,
	// 		Value:this.__controller.Values.Actual.Data
	// 	};

	// }

	public Remove(property?:Schema.Property){
		var repository = this.__controller.Context.GetRepository(this.GetSchema());
		repository.Remove(this);
	}

	public get PrimaryKey():any{
		return this.__controller.PrimaryKey;
	}
	public Load(value:any, server?:boolean){
		this.__controller.Load(value, server);
	}
	public GetValue(property:Schema.Property|string){
		return this.__controller.GetValue(property);
	}
	public SetValue(property:Schema.Property|string, value:any){
		this.__controller.SetValue(property, value);
	}
	public toString():string{
		return this.__controller.toString();
	}
	public toJson():string{
		return JSON.stringify(this.__controller.Actual.Data, null, "\t");
	}
	public Undo(property?:Schema.Property){
		this.__controller.Undo(property);

	}

	public async Duplicate():Promise<Model|undefined>{
		return this.__controller.Duplicate();
	}
}



