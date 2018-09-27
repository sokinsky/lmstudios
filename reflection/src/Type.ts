import { Assembly, Attribute, ConstructorInfo, PropertyInfo } from "./";

export class Type {
	constructor(fullName: string, constructor: (new (...args: any[]) => any) | ConstructorInfo, assembly?: Assembly) {
		this.FullName = fullName;
		if (constructor instanceof ConstructorInfo)
			this.Constructor = constructor;
		else
			this.Constructor = new ConstructorInfo(constructor);
		this.Assembly = assembly;
	}

	public Name: string = "";
	public Namespace: string = "";
	public get FullName(): string {
		if (this.Namespace.length > 0)
			return `${this.Namespace}.${this.Name}`;
		else
			return this.Name;
	}
	public set FullName(value: string) {
		var splits = value.split('.');
		for (var i = 0; i < splits.length; i++) {
			if (i + 1 == splits.length)
				this.Name = splits[i];
			else
				this.Namespace += `${splits[i]}.`
		}
		this.Namespace = this.Namespace.replace(/.$/, "");
	}
	public get BaseType(): Type | undefined {
		var baseConstructor = Object.getPrototypeOf(this.Constructor.Method);
		if (this.Assembly)
			return this.Assembly.GetType(baseConstructor);
		return undefined;
	}

	public Assembly?: Assembly;
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
		console.log(name);
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