import * as Meta from "./Meta";
import { Guid } from "./Utilities";
import { Context, Controller, Utilities } from "./"
import { Repository } from "./Repository";
import { SubRepository } from "./SubRepository";

export class Model {
	constructor()	{
		var proxy:Model|undefined = new Proxy(this, {
			get: (target, propertyName: string | number | symbol, reciever) => {					
				let property:Meta.Property|undefined = this.GetType().GetProperty(propertyName);
				if (property === undefined)
					return Reflect.get(target, propertyName, reciever);

				
				var value = property.GetValue(this);
				if (value === undefined)
					return undefined;

				
				if (property.Type.IsSubTypeOf(Model)){
					var repository = this.Context.GetRepository(property.Type);
					if (value instanceof Model){
						return value;
					}
					else{
						var localValue = repository.Local.Select(value);
						if (localValue === undefined){
							value = repository.Add(value);
							property.SetValue(this, value);
							repository.Server.Select(value.Controller.Values.Current).then(serverValue=>{
								if (property !== undefined)
									property.SetValue(this, serverValue);
							});
						}
					}
				}
				return value;
			},
			set: (target, propertyName, propertyValue, reciever) => {		
				let property:Meta.Property|undefined = this.GetType().GetProperty(propertyName);
				if (property === undefined || property.Type.IsSubTypeOf(SubRepository))
					return Reflect.set(target, propertyName, propertyValue, reciever);
				
				if (property.Type.IsSubTypeOf(Model)){
					var repository = this.Context.GetRepository(property.Type.Name);
					if (typeof(propertyValue) === "object"){
						if (propertyValue instanceof Model){
							repository.Add(propertyValue);
						}
						else {					
							propertyValue = repository.Add(propertyValue);
							property.SetValue(this, propertyValue);
							propertyValue.Refresh();
						}
					}
				}
				property.SetValue(this, propertyValue);
				if (propertyValue instanceof Model){
					var keyProperty = this.GetType().Attributes.PrimaryKey;
					if (keyProperty !== undefined){
						var keyValue = keyProperty.GetValue(propertyValue);
						if (keyValue === undefined)
							keyValue = propertyValue.Controller.ID;
						propertyValue = keyValue;	
					}		
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
						if (subRepository.Initialized === undefined){
							await subRepository.Initialize();
						}
							
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
		var keyProperty = this.GetType().Attributes.PrimaryKey;
		if (keyProperty !== undefined){
			var keyValue = keyProperty.GetValue(this);
			if (keyValue === undefined)
				keyValue = this.Controller.ID;
		}
		return `${this.GetType().Name}(${keyValue})`;
	}
}

