import { ConstructorInfo, PropertyInfo, Type } from "./";

export class Assembly {
	constructor(name: string, root: { Path: string, Module: object }) {
		this.Name = name;
		this.Root = root;
	}
	public Name: string;
	public Root: { Path: string, Module: object };
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


	public async Read() {
		this.readModule(this.Root.Module, this.Name);
	}
	public async readModule(module: object, name: string) {
		console.log(module);
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
	public static async Open(path: string, name?:string): Promise<Assembly> {		
		if (!name) {
			var splits = path.split('/');
			name = splits[splits.length - 1];
		}
		if (!name || name.length == 0)
			throw new Error("invalid assembly.  Please provide a name")
		
		var root: { Path: string, Module: object } = {
			Path: `../../${path}`,
			Module: await import("" + path)
		}

		let result: Assembly = new Assembly(name, root);	
		result.Read();
		return result;
	}
}