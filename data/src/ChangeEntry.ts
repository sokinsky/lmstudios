import { Model, Bridge } from "./";

export enum ChangeStatus {
    Detached = "Detached",
    Unchanged = "Unchanged",
    Added = "Added",
    Deleted = "Deleted",
    Modified = "Modified"
}
export class ChangeEntry {
    constructor(model:Model){
        this.Model = model;
    }
    public Status:ChangeStatus = ChangeStatus.Detached;
    public Model:Model;
}