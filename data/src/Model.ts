import {Schema } from "./";
import { Context, Controller, ChangeStatus } from "./"
import { Repository } from "./Repository";

export class Model {
	constructor(context:Context, data?:Partial<Model>)	{
		this.__context = context;		
		var decoration = ((<any>this).__proto__).decoration;
		this.__schema = this.__context.GetType(decoration.type.name);
		console.log(this.__schema);
		

		var proxy:Model|undefined = new Proxy(this, {
			get: (target, propertyName: string, reciever) => {		
				let property:Schema.Property|undefined = this.GetType().GetProperty(propertyName);
				if (property === undefined)
					return Reflect.get(target, propertyName, reciever);
				return this.__controller.GetValue(property);
			},
			set: (target, propertyName:string, propertyValue, reciever) => {
				console.log(propertyName);
				let property:Schema.Property|undefined = this.GetType().GetProperty(propertyName);
				if (property !== undefined){
					this.__controller.SetValue(property, propertyValue);
					return true;
				}
				return true;
			}
		});
		this.Server = <any>new Proxy(this, {
			get: async (target, propertyName: string, reciever) => {
				let property:Schema.Property|undefined = this.GetType().GetProperty(propertyName);
				if (property === undefined)
					return Reflect.get(target, propertyName, reciever);
				return this.__controller.GetValue(property);
			}
		});
		this.__controller = new Controller(context, this, this);	
		if (decoration.controller !== undefined)
			this.__controller = new decoration.controller()(this.__context, this, proxy);
		this.__context.Changes.Add(proxy);
		return proxy;
	}
	public __context:Context;
	public __schema:Schema.Type;	
	public __controller:Controller<Model>
	public Server:{[p in keyof this]:Promise<this[p]>};

	public GetType() : Schema.Type {
		return this.__schema;
	}
	public ToBridge():{ID:string, Type:string, Value:any}{
		return {
			ID:this.__controller.__id,
			Type:this.GetType().Name,
			Value:this.__controller.__values.Actual.Data
		};
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
	public ChangeStatus():ChangeStatus{
		return this.__controller.GetChangeStatus();
	}

	public toString():string{
		return this.__controller.toString();
	}
}

