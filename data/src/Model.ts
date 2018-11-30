import {Schema } from "./";
import { Context, ContextStatus, Controller, ChangeStatus } from "./"
import { Repository } from "./Repository";

const internal=Symbol();
export class Model {
	[internal]:{
		Context:Context,
		Type:{
			Name:string,
			Constructor:(new (...args: any[]) => Model),
			Schema?:Schema.Type
		}		
		Controller:Controller<Model>
	};
	constructor(context:Context, data?:Partial<Model>)	{
		var decoration = ((<any>this).__proto__).model;
		this[internal] = {					
			Context:context,				
			Type:{
				Name:decoration.name,
				Constructor:<(new (...args: any[]) => Model)>this.constructor
			},
			Controller:new Controller(context, this, this)
		}
		if (context.Initialized){
			this[internal].Type.Schema = this[internal].Context.GetType(this[internal].Type.Name);
		}

		var proxy:Model|undefined = new Proxy(this, {
			get: (target, propertyName: string, reciever) => {
				if (! this[internal].Context.Initialized)	
					return undefined;			
				let property:Schema.Property|undefined = this.GetType().GetProperty(propertyName);
				if (property === undefined)
					return Reflect.get(target, propertyName, reciever);
				return this[internal].Controller.GetValue(property);
			},
			set: (target, propertyName:string, propertyValue, reciever) => {	
				if (! this[internal].Context.Initialized){
					(<any>this[internal].Controller.Values.Pending)[propertyName] = propertyValue;
					return true;
				}					
				let property:Schema.Property|undefined = this.GetType().GetProperty(propertyName);
				if (property !== undefined){
					this[internal].Controller.SetValue(property, propertyValue);
					return true;
				}
				return true;
			}
		});
		this.Server = <any>new Proxy(this, {
			get: async (target, propertyName: string, reciever) => {
				if (! this[internal].Context.Initialized)	
					return undefined;			
				let property:Schema.Property|undefined = this.GetType().GetProperty(propertyName);
				if (property === undefined)
					return Reflect.get(target, propertyName, reciever);
				return this[internal].Controller.GetValue(property);
			}
		});
		if (decoration.controller !== undefined)
			this[internal].Controller = new decoration.controller()(this[internal].Context, this, proxy);
		this[internal].Context.Changes.Add(proxy);
		return proxy;
	}
	public Server:{[p in keyof this]:Promise<this[p]>};

	public GetType() : Schema.Type {
		var result = this[internal].Type.Schema;
		if (result === undefined){
			if (! this[internal].Context.Initialized)
				result = this[internal].Context.GetType(this[internal].Type.Name);	
			this[internal].Type.Schema = result;
		}
		if (result !== undefined)
			return result;
		throw new Error(``);
	}
	public GetController() : Controller<Model>{
		return this[internal].Controller;
	}

	public ToBridge():{ID:string, Type:string, Value:any}{
		return {
			ID:this[internal].Controller.ID,
			Type:this.GetType().Name,
			Value:this[internal].Controller.Values.Actual.Data
		};
	}
	public Load(value:any, server?:boolean){
		this[internal].Controller.Load(value, server);
	}
	public GetValue(property:Schema.Property|string){
		return this[internal].Controller.GetValue(property);
	}
	public SetValue(property:Schema.Property|string, value:any){
		this[internal].Controller.SetValue(property, value);
	}
	public ChangeStatus():ChangeStatus{
		return this[internal].Controller.GetChangeStatus();
	}

	public toString():string{
		return this[internal].Controller.toString();
	}
}

