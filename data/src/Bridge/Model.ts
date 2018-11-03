import * as Data from "..";

export class Model {
	public ID: string = "";
	public Type: string = "";
    public Value: any;

	public Message?: Data.Message;

	public static Create(dataModel:Data.Model|Partial<Model>):Model{
		var result = new Model();
		if (dataModel instanceof Data.Model){
			result.ID = dataModel.Controller.ID;
			result.Type = dataModel.GetType().Name;
			result.Value = dataModel.Controller.Values.Current;			
		}
		else{
			if (dataModel.ID !== undefined)
				result.ID = dataModel.ID
			if (dataModel.Type !== undefined)
				result.Type = dataModel.Type;
			result.Value = dataModel.Value;
		}
		return result;

	}


}
