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
            results.push(entry.Model.ToBridge());	
        });
        return results;
    } 

    public Contains(model:Model):boolean{
        var exists = this.Entries.find(x => {
            return x.Model === model;
        });
        return (exists !== undefined);
    }

    public Update(model?:Model){
        if (model === undefined){
            for (var entry of this.Entries){
                this.Update(entry.Model);
            }
            return;
        }
        var existingEntry  = this.Entries.find(entry => {
            return entry.Model === model;
        });
        if (existingEntry === undefined){
            existingEntry = new ChangeEntry(model);
            existingEntry.Status = model.ChangeStatus();
            this.Entries.push(existingEntry);
        }
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