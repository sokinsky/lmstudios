import { Component, OnInit, AfterViewInit, Input, ViewChild, ViewChildren, QueryList, forwardRef, SchemaMetadata} from "@angular/core";
import * as LMS from "@lmstudios/data";
import { RepositoryControl, ModelControl, ModelTree, ModelNode } from "./";

@Component({
    selector:"context-control",
    templateUrl:"Context.html",
    styleUrls:["Context.css"]
})
export class ContextControl implements OnInit, AfterViewInit {
	constructor() {
    }
    public async ngOnInit(){
    }
    public async ngAfterViewInit(){
    }

    @ViewChild(forwardRef(()=>ModelControl)) ctlModel?:ModelControl;
    @ViewChildren(forwardRef(()=>RepositoryControl)) ctlRepositories?:QueryList<RepositoryControl>;

    private __context?:LMS.Data.Context;
    public get context():LMS.Data.Context{
        if (this.__context === undefined) throw new Error(``);
        return this.__context;
    }
    @Input() public set context(value:LMS.Data.Context){
        this.__context = value;
    }

    public SelectedRepository?:LMS.Data.Repository<LMS.Data.Model>;
    public SelectedModel?:ModelTree;
    public Select(repository:LMS.Data.Repository<LMS.Data.Model>|undefined){
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
