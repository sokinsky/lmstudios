import * as Meta from "./Meta";
import { Guid } from "./Utilities";
import { Context, Controller, Utilities } from "./"
import { Repository } from "./Repository";
import { SubRepository } from "./SubRepository";

export class Model {
	constructor()	{
		var  keyProperties:Meta.Property[] = this.GetType().GetProperties({Key:true});
		switch (keyProperties.length){
			case 0:	throw new Error("");
			default: throw new Error("");
			case 1:
				this.__key = { Property: keyProperties[0], Value:undefined, Guid:Utilities.Guid.Create() };
				break;
		}
		var proxy:Model|undefined = new Proxy(this, {
			get: (target, propertyName: string | number | symbol, reciever) => {					
				let property:Meta.Property|undefined = this.GetType().GetProperty(propertyName);
				if (property === undefined)
					return Reflect.get(target, propertyName, reciever);

				var value = property.GetValue(this);
				//console.log(`getProxy(${<string>propertyName})`);

				
				if (property.Type.IsSubTypeOf(Model)){
					if (! (value instanceof Model)){
						var repository = this.Context.GetRepository(property.Type);
						var localValue = repository.Local.Select(value);
						if (localValue === undefined){
							repository.Server.Select(value).then(serverValue=>{
								if (property !== undefined)
									property.SetValue(this, serverValue);
							})
						}
						else{
							value = localValue;
						}
					}
				}
				return value;
			},
			set: (target, propertyName, propertyValue, reciever) => {		
				let property:Meta.Property|undefined = this.GetType().GetProperty(propertyName);
				if (property === undefined || property.Type.IsSubTypeOf(SubRepository))
					return Reflect.set(target, propertyName, propertyValue, reciever);

				//console.log(`get(proxy)=>${<string>propertyName}:${propertyValue}`);
				property.SetValue(this, propertyValue);
				if (propertyValue instanceof Model){
					if (propertyValue.Key.Value !== undefined)
						propertyValue = propertyValue.Key.Value;
					else
						propertyValue = propertyValue.Key.Guid;						
				}
				property.SetValue(this.Controller.Values.Current, propertyValue);
				this.Context.ChangeTracker.Add(this.Controller.Values.Proxied);
				return true;
			}
		});
		this.Server = <any>new Proxy(this, {
			get: async (target, propertyName: string | number | symbol, reciever) => {
				let property:Meta.Property|undefined = this.GetType().GetProperty(propertyName);
				if (! property)
					return Reflect.get(target, propertyName, reciever);		
					
				//console.log(`getServer(${<string>propertyName})`);
				if (property.Type.IsSubTypeOf(Model)){
					var repository = this.Context.GetRepository(property.Type);
					var item = property.GetValue(this);
					return await repository.Server.Select(item);
				}
				else if (property.Type.IsSubTypeOf(SubRepository) || property.Type.Constructor === SubRepository){
					var subRepository = property.GetValue(this);
					if (subRepository instanceof SubRepository){
						if (subRepository.Initialized === undefined)
							await subRepository.Initialize();
						return subRepository;
					}
				}	
			}
		});
		this.Controller = new Controller(this, proxy);
	 	this.Context.ChangeTracker.Add(proxy);
		return proxy;
	}
	public Server:{[p in keyof this]:Promise<this[p]>};
	public Controller: Controller<Model>;
	private __key:{Property:Meta.Property,Value:string|number|undefined,Guid:Guid};
	public get Key():{Property:Meta.Property,Value:string|number|undefined,Guid:Guid}{
		this.__key.Value = this.__key.Property.GetValue(this.Controller.Values.Unproxied);
		return this.__key;
	}
	public get Context(): Context{
		return <Context>(<any>window)["Context"];
	}
	
	
	public GetType() : Meta.Type {
		var result = Meta.Type.GetType(this);		
		if (result)
			return result;
		throw new Error("");
	}

	public toString():string{
		if (this.Key.Value !== undefined)
			return `${this.GetType().Name}(${this.Key.Value})`;
		else 
			return `${this.GetType().Name}(${this.Key.Guid.Value})`
	}
}

