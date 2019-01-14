import { Context } from "./Context";
import { Model } from "./Model";

export enum ChangeStatus { Detached = "Detached", Unchanged="Unchanged", Modified="Modified", Added="Added", Deleted="Deleted" }
export class ChangeEntry {
    constructor(model:Model){
        this.Model = model;
    }
    public Model:Model
}
export class ChangeTracker {
	constructor(context: Context) {
		this.Context = context;
	}
	public Context: Context;
    public GetEntries(...statuses:ChangeStatus[]):ChangeEntry[]{
        if (statuses.length == 0)
            return [];
        var results:ChangeEntry[] = [];
        for (var status of statuses){
            for (var repository of this.Context.Repositories){
                var models = repository.Items.filter(x => { return x.__controller.Status.Change.Model === status; });
                for (var model of models){
                    var exists = results.find(x => { return x.Model === model; });
                    if (exists === undefined){
                        var result = new ChangeEntry(model);
                        results.push(result);
                    }
                }
            }
        }
        return results;
    }
    public get Entries():ChangeEntry[]{
        return this.GetEntries(ChangeStatus.Added, ChangeStatus.Modified, ChangeStatus.Deleted, ChangeStatus.Unchanged);;
    }
    public get Changes():ChangeEntry[]{
        return this.GetEntries(ChangeStatus.Added, ChangeStatus.Modified, ChangeStatus.Deleted);
    }
    public GetBridgeChanges():any[]{
        var results:any[] = [];
		this.Changes.forEach((entry: ChangeEntry) => {	
            results.push({
                ID:entry.Model.__controller.ID,
                Type:entry.Model.GetSchema().Type.FullName,
                Value:entry.Model.__controller.Values.Local
            });	
        });
        return results;
    } 
}