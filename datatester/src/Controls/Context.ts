import { Component, OnInit, AfterViewInit, Input, ViewChild, ViewChildren, QueryList, forwardRef} from "@angular/core";
import { Context, Repository, Model, Response, ResponseStatus } from "@lmstudios/data";
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

    public SelectedItem:Repository<Model>|Model|undefined;
    public Select(value:Repository<Model>|Model){
        this.SelectedItem = value;
        if (this.SelectedItem instanceof Model){
            if (this.ctlModel !== undefined)
                this.ctlModel.model = this.SelectedItem;
        }
    }


    public Add(){
        if (this.SelectedItem instanceof Repository){
            console.log("Add");
        }
    }


    public OK(){
        if (this.SelectedItem instanceof Model){
            console.log("OK");
        }
    }
    public Cancel(){
        if (this.SelectedItem instanceof Model){
            console.log("Cancel");
        }
    }
    public Log(item:any){
        console.log(item);
    }
}