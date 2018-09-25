import { Assembly, ConstructorInfo, PropertyInfo } from "./";

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
}