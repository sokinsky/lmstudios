import { Guid } from "@lmstudios/utilities";
import { ConstructorInfo, PropertyInfo, Attributes } from "./";

export class Type {
	constructor(init: (new (...args: any[]) => any)|string, fullName?:string) {		
		switch (typeof(init)){
			case "string":
				this.FullName = <string>init;
				break;
			case "function":
				this.Constructor = new ConstructorInfo(<new (...args: any[]) => any>init);
				if (fullName === undefined)
					this.FullName = (<new (...args: any[]) => any>init).name;
				else
					this.FullName = fullName;
				break;
		}
	}

	public ID:string = Guid.Create().toString();
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
		if (this.Constructor === undefined)
			return undefined;
		var constructor = Object.getPrototypeOf(this.Constructor.Method);
		return TypeCollection.GetType(constructor);
	}

	public Constructor?: ConstructorInfo;
	public Properties: PropertyInfo[] = [];
	public GetProperties(attributes?:Attributes|Partial<Attributes>):PropertyInfo[] {
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

		if (attributes){
			result = result.filter(x=>{
				for(var key in attributes){
					if ((<any>attributes)[key] != (<any>x.Attributes)[key])
					return false;
				}
				return true;
			})
		}



		return result;		
	}
	public GetProperty(name:string):PropertyInfo|undefined{
		return this.GetProperties().find(x=>{
			return x.Name == name;
		});
	}

	public IsSubTypeOf(type: new (...arg: any[]) => any) : boolean {
		if (this.Constructor === undefined)
			return false;

		var check:any = this.Constructor.Method;
		while (check) {
			if (check === type)
				return true;
			check = Reflect.getPrototypeOf(check);
		}
		return false;		
	}


	public Create(...args: any[]):any{
		if (this.Constructor === undefined)
			return undefined;
		return this.Constructor.Invoke(...args);
	}


}
export class TypeCollection {
	public __items:Type[] = [];
	public Select(type:(new(...args:any[])=>any)|string):Type|undefined{
		return this.__items.find((item:Type)=>{
			switch (typeof(type)){
				case "string":
					if (item.FullName === undefined)
						return false;
					else if(item.FullName === <string>type)
						return true;
					else
						return false;
				case "function":
					if (item.Constructor === undefined)
						return false;
					else if (item.Constructor.Method === type)
						return true;
					return false;
				default:
					return false;
			}
		})
	}

	public static GetCollection() : TypeCollection {
		var result = <TypeCollection>(<any>window).Types;
		if (! result){
			result = new TypeCollection();
			(<any>window).Types = result;
		}
		return result;
	}

	public static Add(type:(new(...args:any[])=>any)|string, fullName?:string):Type{
		var collection:TypeCollection = this.GetCollection();
		let result = collection.Select(type);
		if (! result){
			result = new Type(type, fullName);
			collection.__items.push(result);
		}
		return result;
	}
	public static Remove(type:Type){
		var collection:TypeCollection = this.GetCollection();
		var index = collection.__items.indexOf(type);
		if (index < 0)
			return;

		var before = collection.__items;
		collection.__items.splice(index, 1);
		var after = collection.__items;
		collection.__items.forEach((item:Type)=>{
			 var property = item.GetProperties().find(x=>{
				 return x.Type === type;
			 });
			 if (property){
				 var propertyType:Type|undefined = collection.Select(type.FullName);
				 if (propertyType){
					property.Type = propertyType;
				 }					 
				 else
				 	throw new Error("");
			 }
		});
	}

	public static GetType(type:(new(...args:any[])=>any)|string):Type|undefined{
		var collection:TypeCollection = this.GetCollection();
		return collection.Select(type);	
	}
}