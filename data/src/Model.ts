import * as LMS from "./";
export class Model {
	constructor(context:LMS.Context, data?:Partial<Model>)	{
		this.__context = context;
		
		var schemaName = ((<any>this).__proto__).model.FullName;
		var schema = this.__context.Schema.Models.find(x => x.FullName === schemaName);
		if (schema === undefined)
			throw new Error(`Model.constructor():Invalid Schema(${schemaName})`);
		this.__schema = schema;
				

		var proxy:Model|undefined = new Proxy(this, {
			get: (target, propertyName: string, reciever) => {
				let property:LMS.Schema.Property|undefined = this.GetSchema().GetProperty(propertyName);
				if (property === undefined)
					return Reflect.get(target, propertyName, reciever);
				return this.__controller.GetValue(property);
			},
			set: (target, propertyName:string, propertyValue, reciever) => {
				let property:LMS.Schema.Property|undefined = this.GetSchema().GetProperty(propertyName);
				if (property !== undefined){
					this.__controller.SetValue(property, propertyValue);
					return true;
				}
				return true;
			}
		});
		this.Server = <any>new Proxy(this, {
			get: async (target, propertyName: string, reciever) => {
				let property:LMS.Schema.Property|undefined = this.GetSchema().GetProperty(propertyName);
				if (property === undefined)
					return Reflect.get(target, propertyName, reciever);
				return this.__controller.GetValueAsync(property);
			}
		});
		var createController = ((<any>this).__proto__).model.Controller;
		if (createController !== undefined)
			this.__controller = new (createController())(context, this, proxy);	
		else
			this.__controller = new LMS.Controller(context, this, proxy);	
		return proxy;
	}
	public __context:LMS.Context;
	public __schema:LMS.Schema.Model;
	public __controller:LMS.Controller<Model>
	public Server:{[p in keyof this]:Promise<this[p]>};

	public GetSchema(): LMS.Schema.Model{
		return this.__schema;
	}
	public ToBridge():{ID:string, Type:string, Value:any}{
		return {
			ID:this.__controller.ID,
			Type:this.GetSchema().FullName,
			Value:this.__controller.Values.Actual.Data
		};
	}
	public Load(value:any, server?:boolean){
		this.__controller.Load(value, server);
	}
	public GetValue(property:LMS.Schema.Property|string){
		return this.__controller.GetValue(property);
	}
	public SetValue(property:LMS.Schema.Property|string, value:any){
		this.__controller.SetValue(property, value);
	}
	public toString():string{
		return this.__controller.toString();
	}
}

