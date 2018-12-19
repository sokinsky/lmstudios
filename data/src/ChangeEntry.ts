import { Model } from "./";
export enum ChangeStatus { Unchanged = "Unchanged", Modified = "Modified", Added = "Added", Deleted = "Deleted" }

console.log("LMS.Data.ChangeEntry");

export class ChangeEntry {
    constructor(model:Model, status?:ChangeStatus, properties?:{[name:string]:ChangeStatus}){
        this.Model = model;
        if (status !== undefined)
            this.Status = status;
        if (properties !== undefined)
            this.Properties = properties;
    }
    public Model:Model;
    public Status:ChangeStatus = ChangeStatus.Unchanged;    
    public Properties:{[name:string]:ChangeStatus} = {}
}