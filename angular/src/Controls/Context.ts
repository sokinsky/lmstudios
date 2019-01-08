import { Component, OnInit, AfterViewInit, Input, ViewChild, ViewChildren, QueryList, forwardRef, SchemaMetadata} from "@angular/core";
import * as LMSData from "@lmstudios/data";
import { RepositoryControl, ModelControl, ModelTree, ModelNode } from "./";

@Component({
    selector:"lmscontrol-context",
    templateUrl:"Context.html",
    styleUrls:["Context.css"],
    
})
export class ContextControl {
	constructor() {
    }
    private __context?:LMSData.Context;
    public get context():LMSData.Context{
        if (this.__context === undefined) throw new Error(``);
        return this.__context;
    }
    @Input() public set context(value:LMSData.Context){
        this.__context = value;
    }

    public SelectedRepository?:LMSData.Repository<LMSData.Model>;
    public SelectedModel?:ModelTree;
    public Select(repository:LMSData.Repository<LMSData.Model>|undefined){
        this.SelectedRepository = repository;
        this.SelectedModel = undefined;
    }

    public Save(){
        this.context.SaveChanges();
    }
    public Log(item:any){
        console.log(item);
    }
}
