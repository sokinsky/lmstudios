import * as Data from "..";

export class Model {
	constructor(init: Model | Partial<Model>) {	
		if (init instanceof Model) {
            this.ID = init.ID;
			this.Type = init.Type;
			this.Value = init.Value;
			this.Map = init.Map;
		}
		else {
			this.ID = (<any>init).ID;
			this.Type = (<any>init).Type;
			this.Value = (<any>init).Value;
			this.Map = (<any>init).Map;
		}
    }

	public ID: string;
	public Type: string;
    public Value: any;
	public Map: any;

	public Message?: Data.Message;


}
