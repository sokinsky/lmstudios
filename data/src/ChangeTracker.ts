import { Context, ChangeEntry, ChangeStatus, Model } from "./";

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
                        var result = new ChangeEntry(model, model.__controller.Status.Change.Model, model.__controller.Status.Change.Properties);
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
            results.push(entry.Model.ToBridge());	
        });
        return results;
    } 
}