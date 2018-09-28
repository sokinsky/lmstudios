import { ConstructorInfo, PropertyInfo, Type, Attribute } from "./";

export class Assembly {
	public Name: string = ""
	public Module: object = {}
	public References:Assembly[] = [];
	public Types: Type[] = [];

	public GetType(filter: string | (new (...args: any[]) => any) | object): Type | undefined {
		if (typeof (filter) == "object")
			return this.GetType(filter.constructor);
		return this.Types.find((x) => {
			switch (typeof (filter)) {
				case "string":
					return (x.FullName == filter);
				case "function":
					return (x.Constructor.Method == filter);
				default:
					return false;
			}
		});
	}
/* 	public async Read() {
		this.readModule(this.Module, this.Name);

		this.Types.forEach((type:Type)=>{
			var properties = (<any>type.Constructor.Method).__properties;
			
			for (var name in properties){
				var propertyType = this.GetType(properties[name].Type)
				if (! propertyType)
					propertyType = new Type(properties[name].Type.name, properties[name].Type)
				var propertyInfo = new PropertyInfo(name, type);
				var attributes = properties[name].Attributes;
				if (attributes){
					attributes.forEach((attribute:Attribute)=>{
						propertyInfo.Attributes.push(attribute);
					});	
				}
				type.Properties.push(propertyInfo);
			}
		});
	}
	public async readModule(module: object, name: string) {
		for (var key in module) {
			var propertyValue = (<any>module)[key];
			var propertyName = `${name}.${key}`;
			if (propertyValue === undefined) {
				console.warn(`${propertyName} was undefined`)
			}
			else {
				switch (typeof (propertyValue)) {
					case "function":
						this.readconstructor(propertyValue, propertyName);
						break;
					case "object":
						this.readModule(propertyValue, propertyName);
						break;
				}
			}
		}
	}
	public async readconstructor(constructor: new (...args: any[]) => any, name:string) {
		var type = new Type(name, constructor, this);

		this.Types.push(type);
	}
	public static async Open(name:string, modulePromise:Promise<object>): Promise<Assembly> {		
		var module = await modulePromise;
		let result:Assembly = new Assembly();
		result.Name = name;
		result.Module = module;
		result.Read();
		return result;
	} */
}