import { Component, OnInit, AfterViewInit, Input, ViewChild, ViewChildren, QueryList, forwardRef, SchemaMetadata} from "@angular/core";
import { Context, Collection, Repository, Model, Response, ResponseStatus, Schema } from "@lmstudios/data";
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

    private __context?:Context;
    public get context():Context{
        if (this.__context === undefined) throw new Error(``);
        return this.__context;
    }
    @Input() public set context(value:Context){
        this.__context = value;
    }

    public SelectedRepository?:Repository<Model>;
    public SelectedModel?:ModelTree;
    public Select(repository:Repository<Model>|undefined){
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
