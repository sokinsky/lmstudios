import {Schema } from "../";
import { Context, ContextStatus, Controller } from "./"
import { ChangeStatus } from "./ChangeEntry";

export class Model {
	public __internal:{
		context:Context,
		name:string,
		type:{
			constructor:(new (...args: any[]) => Model),
			schema?:Schema.Type
		}		
		controller:Controller<Model>
	};
	constructor(context:Context, data?:Partial<Model>)	{
		var decoration = ((<any>this).__proto__).model;
		this.__internal = {					
			context:context,
			name:decoration.name,	
			type:{
				constructor:<(new (...args: any[]) => Model)>this.constructor,
				schema:undefined
			},
			controller:new Controller(context, this, this)
		}

		var proxy:Model|undefined = new Proxy(this, {
			get: (target, propertyName: string | number | symbol, reciever) => {	
				if (this.__internal.context.Status === ContextStatus.None)
					return undefined;				
				if (typeof(propertyName) !== "string")
					return Reflect.get(target, propertyName, reciever);
				let property:Schema.Property = this.GetType().GetProperty(propertyName);
				return this.__internal.controller.GetValue(property);
			},
			set: (target, propertyName, propertyValue, reciever) => {		
				if (typeof(propertyName) !== "string")
					return Reflect.get(target, propertyName, reciever);
				let property:Schema.Property|undefined = this.GetType().GetProperty(propertyName);
				if (property === undefined)
					return Reflect.set(target, propertyName, propertyValue, reciever);
				this.__internal.controller.SetValue(property, propertyValue);
				return true;
			}
		});
		this.Server = <any>new Proxy(this, {
			get: async (target, propertyName: string | number | symbol, reciever) => {
				if (typeof(propertyName) !== "string")
					return Reflect.get(target, propertyName, reciever);
				let property:Schema.Property|undefined = this.GetType().GetProperty(propertyName);
				if (! property)
					return Reflect.get(target, propertyName, reciever);	
				return await this.__internal.repository.Select(this);

			}
		});
		if (decoration.controller !== undefined)
			this.__internal.controller = new decoration.controller()(this.__internal.context, this, proxy);
		this.__internal.context.ChangeTracker.Add(proxy);
		return proxy;
	}
	public Server:{[p in keyof this]:Promise<this[p]>};

	public GetType() : Schema.Type {
		var result:Schema.Type|undefined = undefined;
		if (this.__internal.context.Status == ContextStatus.None)
			throw new Error(`Model.GetType() was called before the context was initialized`);
		if (this.__internal.context.Schema !== undefined)
			result = this.__internal.context.Schema.GetType(this.__internal.name);
		if (result === undefined)
			throw new Error(`Model.GetType() could not locate the schema for type(${this.__internal.name})`);
		return result;
	}


	public Load(value:any, server?:boolean){
		this.__internal.controller.Load(value, server);
	}
	public Refresh(values?:Partial<Model>){
		this.__internal.controller.Refresh(values);
	}
	public GetValue(property:Schema.Property|string){
		return this.__internal.controller.GetValue(property);
	}
	public SetValue(property:Schema.Property|string, value:any){
		this.__internal.controller.SetValue(property, value);
	}
	public ChangeStatus():ChangeStatus{
		return this.__internal.controller.GetChangeStatus();
	}

	public toString():string{
		return this.__internal.controller.toString();
	}
}

