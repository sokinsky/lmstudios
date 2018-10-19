import { Attributes, Type } from ".";

export class PropertyInfo {
	constructor(name: string, type: Type) {
		this.Name = name;
		this.Type = type;
	}
	public Name: string;
	public Type: Type;
	public Attributes:Attributes = new Attributes();

	public GetValue(item: object) {
		return (<any>item)[this.Name];
	}
	public SetValue(item: object, value: any) {
		(<any>item)[this.Name] = value;
	}
}