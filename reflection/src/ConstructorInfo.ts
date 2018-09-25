export class ConstructorInfo {
	constructor(method: new (...args: any[]) => any) {
		this.Method = method;
	}
	public Method: new (...args: any[]) => any;

	public Invoke(...args: any[]): object {
		return new this.Method(...args);
	}
}