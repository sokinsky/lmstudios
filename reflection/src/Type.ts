import { Assembly, Attribute, ConstructorInfo, PropertyInfo } from "./";

export class Type {
	constructor(constructor: (new (...args: any[]) => any), fullName?:string) {		
		this.Constructor = new ConstructorInfo(constructor);	
		if (!fullName)
			fullName = constructor.name
		this.FullName = fullName;	
	}

	public Name?: string;
	public Namespace?: string;
	public get FullName(): string {
		if (this.Namespace && this.Namespace.length > 0)
			return `${this.Namespace}.${this.Name}`;
		else if (this.Name)
			return this.Name;
		throw new Error("Invalid Type");
	}
	public set FullName(value: string) {
		var splits = value.split('.');
		for (var i = 0; i < splits.length; i++) {
			if (i + 1 == splits.length)
				this.Name = splits[i];
			else{
				if (!this.Namespace)
					this.Namespace = "";
				this.Namespace += `${splits[i]}.`
			}
				
		}
		if (this.Namespace)
			this.Namespace = this.Namespace.replace(/.$/, "");
	}
	public get BaseType(): Type | undefined {
		var baseConstructor = Object.getPrototypeOf(this.Constructor.Method);
		return undefined;
	}

	public Constructor: ConstructorInfo;
	public Properties: PropertyInfo[] = [];
	public GetProperties(filter?:Type|(new(...args:any[])=>Attribute)):PropertyInfo[] {
		var result: PropertyInfo[] = [];
		var typeChain: Type[] = [];
		var type:Type|undefined = this;
		while (type) {
			typeChain.push(<Type>type);
			type = (<Type>type).BaseType;
		}
		typeChain = typeChain.reverse();
		
		typeChain.forEach((item: Type) => {
			item.Properties.forEach((property: PropertyInfo) => {
				result.push(property);
			});
		});

		switch (typeof(filter)){
			case "object":
				result = result.filter((propertyInfo:PropertyInfo)=>{
					return propertyInfo.Type === filter;
				});
				break;
			case "function":
				result = result.filter((propertyInfo:PropertyInfo)=>{
					var check = propertyInfo.Attributes.find((x) => {
						return x.constructor === filter
					});
					return (check);
				});
				break;
		}
		return result;		
		
		//return this.Properties;
	}
	public GetProperty(name:string):PropertyInfo|undefined{
		return this.GetProperties().find(x=>{
			return x.Name == name;
		});
	}

	public IsSubTypeOf(type: new (...arg: any[]) => any) : boolean {
		var check:any = this.Constructor.Method;
		while (check) {
			if (check === type)
				return true;
			check = Reflect.getPrototypeOf(check);
		}
		return false;		
	}


	public Create(...args: any[]):any{
		return this.Constructor.Invoke(...args);
	}


}
export class TypeCollection {
	public __items:Type[] = [];
	public Select(type:Type|(new(...args:any[])=>any)|object|string):Type|undefined{
		if (typeof(type) === "object" && !(type instanceof Type))
			return this.Select(type.constructor); 
		var matches = this.__items.filter((item:Type)=>{
			switch (typeof(type)){
				case "string":
					return (item.FullName === <string>type);
				case "object":
					return (item === <Type>type);
				case "function":
					return (item.Constructor.Method === <new(...args:any[])=>any>type);
			}
		});
		switch (matches.length){
			case 0:
				return undefined;
			case 1:
				return matches[0];
			default:
				throw new Error("Ambiguous Type");
		}
	}
	public Add(type:(new(...args:any[])=>any), fullName?:string):Type{
		let select = this.Select(type);
		if (! select && fullName)
			select = this.Select(fullName);
		if (select)
			return select;
		
		var result;
		result = new Type(type);
		if (fullName)
			result.FullName = fullName;
		this.__items.push(result);
		return result;
	}

	public static GetType(type:(new(...args:any[])=>any)):Type{
		var types = <TypeCollection>(<any>window).Types;
		if (! types){
			types = new TypeCollection();
			(<any>window).Types = types;
		}

		var result = types.Select(type);
		if (! result){
			result = types.Add(type)
		}
		return result;			
	}
}