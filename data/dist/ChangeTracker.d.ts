import { Context } from "./Context";
import { Model } from "./Model";
export declare enum ChangeStatus {
    Detached = "Detached",
    Unchanged = "Unchanged",
    Modified = "Modified",
    Added = "Added",
    Deleted = "Deleted"
}
export declare class ChangeEntry {
    constructor(model: Model);
    Model: Model;
}
export declare class ChangeTracker {
    constructor(context: Context);
    Context: Context;
    GetEntries(...statuses: ChangeStatus[]): ChangeEntry[];
    readonly Entries: ChangeEntry[];
    readonly Changes: ChangeEntry[];
    GetBridgeChanges(): any[];
}
