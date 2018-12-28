import { Component, OnInit, Input } from "@angular/core";
import { Context, Repository, Model, Response, ResponseStatus } from "@lmstudios/data";
import { RepositoryControl } from "./Repository";
import { Data } from "../STA";
import { RaceOperator } from "rxjs/internal/observable/race";

@Component({
    selector:"context-control",
    templateUrl:"Context.html",
    styleUrls:["Context.css"]
})
export class ContextControl implements OnInit {
	constructor() {
    }
    public async ngOnInit(){
    }
    private __value?:Context;
    public get Value():Context{
        if (this.__value === undefined) throw new Error(``);
        return this.__value;
    }
    @Input() public set Value(value:Context){
        this.__value = value;
    }

    public Display:{
        Type:string
    } = { Type:"none" }

    private __parentItem?:Model;
    public get ParentItem():Model|undefined{
        return this.__parentItem;
    }
    public set ParentItem(value:Model|undefined){
        this.__parentItem = value;
    }

    private __selectedItem?:Repository<Model>|Model;
    public get SelectedItem():Repository<Model>|Model|undefined{
        return this.__selectedItem;
    }
    public set SelectedItem(value:Repository<Model>|Model|undefined){
        this.__selectedItem = value;
        if (this.__selectedItem !== undefined){
            if (this.__selectedItem instanceof Repository)
                this.Display.Type = "Repository";
            else if (this.__selectedItem instanceof Model)
                this.Display.Type = "Model";
            else
                this.Display.Type = "none";
        }
        console.log(this.Display);
    }
    public SaveResponse?:Response;
    public get SaveResponseStatus():string{
        if (this.SaveResponse === undefined)
            return "None";
        return this.SaveResponse.Status.toString();
    }


    public async saveContext(){
        if (this.Value !== undefined)
            this.SaveResponse = await this.Value.SaveChanges();            
    }


    public Log(item:any){
        console.log(item);
    }
}