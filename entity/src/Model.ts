import * as Meta from "./Meta";
import { Application, Context, Controller } from "./"

export class Model {
	constructor()	{
		var proxy:Model|undefined = new Proxy(this, {
			get: (target, propertyName: string | number | symbol, reciever) => {					
				let property:Meta.Property|undefined = this.GetType().GetProperty(propertyName);
				if (! property)
					return Reflect.get(target, propertyName, reciever);
				
				var result = property.GetValue(this);				
				if (result && property && property.Type && property.Type.IsSubTypeOf(Model) && !(result instanceof Model)){
					var localValue = this.Context.GetRepository(property.Type.Name).Local.Select(result);
					property.SetValue(this, localValue);
					if (! localValue){
						this.Context.GetRepository(property.Type.Name).Server.Select(result).then(serverValue=>{
							if (property)
								property.SetValue(this, serverValue);
						})
					}					
					result = localValue;
				}
				return result;
			},
			set: (target, propertyName, propertyValue, reciever) => {
				let property:Meta.Property|undefined = this.GetType().GetProperty(propertyName);
				if (! property)
					return Reflect.set(target, propertyName, propertyValue, reciever);

				if (propertyValue === undefined){
					property.SetValue(this, propertyValue);
				}			
				else {
					if (property.Type){
						if (property.Type.IsSubTypeOf(Model)){
							switch (typeof(propertyValue)){
								case "object":
									if (! (propertyValue instanceof Model)) 
										propertyValue = this.Context.GetRepository(property.Type.Name).Add(propertyValue);

									var foreignKeys = propertyValue.GetType().GetProperties(this.GetType());
									switch (foreignKeys.length){
										case 0:
											break;
										case 1:
											foreignKeys[0].SetValue(propertyValue, this);
											break;
										default:
											console.warn(`${this.GetType().Name} has multiple properties with type(${propertyValue.GetType().Name})`);
									}
									break;
							}
						}	
					}	
					property.SetValue(this, propertyValue);				
				}

				
				this.Context.ChangeTracker.Update(this);
				return true;
			}
		});
		this.Sync = this;
		this.Async = new Proxy(this, {
			get: async (target, propertyName: string | number | symbol, reciever) => {
				let property:Meta.Property|undefined = this.GetType().GetProperty(propertyName);
				if (! property)
					return Reflect.get(target, propertyName, reciever);	
					
				var result = property.GetValue(this);
				console.log(result);
				if (result === undefined)
					return result;

				if (property.Type){
					if (property.Type.IsSubTypeOf(Model)){
						if (! (result instanceof Model)){
							result = await this.Context.GetRepository(property.Type.Name).Server.Select(result);
						}
					}						
				}
				return result
			}
		});
		return proxy;
	}
	public Sync:any;
	public Async:any;
	public get Key():any{
		var  keyProperties:Meta.Property[] = this.GetType().GetProperties({Key:true});
		switch (keyProperties.length){
			case 0:
				throw new Error(`Model(${this.GetType().Name}) does not have a key property`);
			case 1:
				return keyProperties[0].GetValue(this);
			default:
				throw new Error(`Model(${this.GetType().Name}) key is ambiguous`);
		}
	}
	public get Context(): Context{
		return <Context>(<any>window)["Context"];
	}
	private __controller:Controller<Model>|undefined;
	public get Controller(): Controller<Model> {		
		if (!this.__controller)
			this.__controller = new Controller(this);
		return this.__controller;
	}
	
	public GetType() : Meta.Type {
		var result = Meta.Type.GetType(this);		
		if (result)
			return result;
		throw new Error("");
	}
}

