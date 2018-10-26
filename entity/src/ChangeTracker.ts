import * as Bridge from "./Bridge";
import { Context, ChangeEntry, ChangeStatus, Model } from "./";

export class ChangeTracker {
	constructor(context: Context) {
		this.Context = context;
	}
	public Context: Context;
    public Entries : ChangeEntry[] = []
    public get Changes():ChangeEntry[]{
        return this.Entries.filter(x =>{
            return (x.Status !== ChangeStatus.Unchanged && x.Status !== ChangeStatus.Detached);
        })
    }
    public GetBridgeChanges():Bridge.Model[]{
        var result:Bridge.Model[] = [];
		this.Changes.forEach((entry: ChangeEntry) => {	
            result.push(entry.Model.Controller.Bridge())	
        });
        return result;
    } 

    public Contains(model:Model):boolean{
        var exists = this.Entries.find(x => {
            return x.Model === model;
        });
        return (exists !== undefined);
    }
	public Add(model: Model) {
        var entry = this.Entries.find(x => {
            return x.Model === model.Local;
        });
        if (entry === undefined){
            entry = new ChangeEntry(model.Local);
            this.Entries.push(entry);
        }
        entry.Status = model.Controller.GetStatus();
	}
	public Clear() {
		this.Entries = [];
	}
}