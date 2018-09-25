import { Type } from ".";

export class PropertyInfo {
	constructor(name: string, propertyType?: Type) {
		this.Name = name;
		this.PropertyType = propertyType;
	}
	public Name: string;
	public PropertyType?: Type;

	public GetValue(item: object) {
		return (<any>item)[this.Name];
	}
	public SetValue(item: object, value: any) {
		(<any>item)[this.Name] = value;
	}
}