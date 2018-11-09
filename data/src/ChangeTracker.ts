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
        var results:Bridge.Model[] = [];
		this.Changes.forEach((entry: ChangeEntry) => {	
            var result = Bridge.Model.Create(entry.Model);
            results.push(result);	
        });
        return results;
    } 

    public Contains(model:Model):boolean{
        var exists = this.Entries.find(x => {
            return x.Model === model;
        });
        return (exists !== undefined);
    }
	public Add(model: Model) {
        var entry = this.Entries.find(x => {
            return x.Model === model;
        });
        if (entry === undefined){
            entry = new ChangeEntry(model);
            this.Entries.push(entry);
        }
        entry.Status = model.Controller.GetChangeStatus();
	}
	public Clear() {
		this.Entries = [];
	}
}