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
    public GetBridgeChanges():any[]{
        var results:any[] = [];
		this.Changes.forEach((entry: ChangeEntry) => {	
            var result = {
                ID:entry.Model.__internal.controller.__internal.id,
                Type:entry.Model.GetType().Name,
                Value:entry.Model.__internal.controller.__internal.values.actual.data
            }
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
        entry.Status = model.ChangeStatus();
	}
	public Clear() {
		this.Entries = [];
	}
}