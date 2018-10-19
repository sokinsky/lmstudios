import * as Meta from "./Meta";
import { Context, Controller } from "./"

export class Model {
	constructor()	{
		var proxy:Model|undefined = new Proxy(this, {
			get: (target, propertyName: string | number | symbol, reciever) => {					
				let property:Meta.Property|undefined = this.GetType().GetProperty(propertyName);
				if (! property)
					return Reflect.get(target, propertyName, reciever);
				
				return this.Controller.GetValue(property);
			},
			set: (target, propertyName, propertyValue, reciever) => {				
				let property:Meta.Property|undefined = this.GetType().GetProperty(propertyName);
				if (! property)
					return Reflect.set(target, propertyName, propertyValue, reciever);

				this.Controller.SetValue(property, propertyValue);
				return true;
			}
		});
		this.Local = this;
		this.Server = <any>new Proxy(this, {
			get: async (target, propertyName: string | number | symbol, reciever) => {
				let property:Meta.Property|undefined = this.GetType().GetProperty(propertyName);
				if (! property)
					return Reflect.get(target, propertyName, reciever);					
				return await this.Controller.Async.GetValue(property);
			}
		});
		this.Controller = new Controller(this);
		this.Context.ChangeTracker.Add(proxy);
		return proxy;
	}
	public Local: {[p in keyof this]:this[p]};
	public Server:{[p in keyof this]:Promise<this[p]>};
	public get Key():{Property:Meta.Property,Value:any}{
		var result:{Property:Meta.Property,Value:any};

		var  keyProperties:Meta.Property[] = this.GetType().GetProperties({Key:true});
		switch (keyProperties.length){
			case 0:
				throw new Error(`Model(${this.GetType().Name}) does not have a key property`);
			case 1:
				return {
					Property:keyProperties[0],
					Value:keyProperties[0].GetValue(this)
				}
			default:
				throw new Error(`Model(${this.GetType().Name}) key is ambiguous`);
		}
	}
	public get Context(): Context{
		return <Context>(<any>window)["Context"];
	}
	public Controller: Controller<Model>;
	
	public GetType() : Meta.Type {
		var result = Meta.Type.GetType(this);		
		if (result)
			return result;
		throw new Error("");
	}

	public toString():string{
		if (this.Key !== undefined)
			return `${this.GetType().Name}(${this.Key})`;
		else 
			return `${this.GetType().Name}(${this.Controller.Guid.Value})`
	}
}

