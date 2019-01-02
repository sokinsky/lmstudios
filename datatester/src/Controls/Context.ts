import { Component, OnInit, AfterViewInit, Input, ViewChild, ViewChildren, QueryList, forwardRef, SchemaMetadata} from "@angular/core";
import { Context, Repository, Model, Response, ResponseStatus, Schema } from "@lmstudios/data";
import { RepositoryControl, ModelControl } from "./";
import { Data } from "../STA";
import { RaceOperator } from "rxjs/internal/observable/race";

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

    public Tree?:ContextTree;
    public Select(value:Repository<Model>|Model){
        this.Tree = new ContextTree(value);
    }
    public Add(){
    }


    public OK(){
    }
    public Cancel(){
    }
    public Log(item:any){
        console.log(item);
    }
}
export class ContextTree {
    constructor(item:Model|Repository<Model>, action?:string){
        this.Root = new ContextNode(item, action);
    }
    public Root:ContextNode;
    public get Current():ContextNode{
        var result:ContextNode = this.Root;
        while (result.Child !== undefined){
            result = result.Child;
        }
        return result;
    }
}

export class ContextNode {
    constructor(item:Model|Repository<Model>, action?:string){
        this.Item = item;
        this.Action = action;
    }
    public Item:Model|Repository<Model>;
    public Action?:string;
    public Property?:Schema.Property;
    
    public Parent?:ContextNode;
    
    private __child?:ContextNode;
    public get Child():ContextNode|undefined{
        return this.__child;
    }
    public set Child(value:ContextNode|undefined){
        if (value !== undefined)
            value.Parent = this;
        this.__child = value;
    }
}