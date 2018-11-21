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
				return this.Controller.GetValue(property);
			},
			set: (target, propertyName, propertyValue, reciever) => {		
				let property:Meta.Property|undefined = this.GetType().GetProperty(propertyName);
				if (property === undefined)
					return Reflect.set(target, propertyName, propertyValue, reciever);
				this.Controller.SetValue(property, propertyValue);
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

	public get Key():{Property:Meta.Property, Value:any}{
		return this.Controller.Key;
	}

	public Load(value:any, server?:boolean){
		this.Controller.Load(value, server);
	}
	public Refresh(values?:Partial<Model>){
		this.Controller.Refresh(values);
	}
	public GetValue(property:Meta.Property|string){
		return this.Controller.GetValue(property);
	}
	public SetValue(property:Meta.Property|string, value:any){
		this.Controller.SetValue(property, value);
	}

	public toString():string{
		return this.Controller.toString();
	}
}

