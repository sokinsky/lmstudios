export class Guid {
	constructor(value?: string) {
		if (value)
			this.Value = value;
	}
	public Value: string = "00000000-0000-0000-0000-000000000000";
	public toString() {
		return this.Value;
	}

	public static Create(): Guid {
		var s4 = () => {
			return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
		}
		return new Guid(`${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`);
	}
}