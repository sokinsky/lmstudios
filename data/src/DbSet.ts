import { Context } from "./Context";
import { Model } from "./Model";

export class DbSet<TModel extends Model> {
	constructor(context:Context, model: (new (...args: any[]) => TModel)) {
    }
    
}