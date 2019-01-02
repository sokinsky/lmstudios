import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { Repository, Model, Schema } from "@lmstudios/data";
import { ContextControl, ContextNode } from "./Context";

@Component({
    selector:"repository-control",
    templateUrl:"Repository.html",
    styleUrls:["Repository.css"]
})
export class RepositoryControl implements OnInit {
	constructor() { 
    }
    public async ngOnInit(){
    }

    private __contextControl?:ContextControl
    public get ContextControl():ContextControl{
        if (this.__contextControl === undefined) throw new Error(``);
        return this.__contextControl;
    }
    @Input() public set ContextControl(value:ContextControl){
        this.__contextControl = value;
    }
    private __repository?:Repository<Model>;
    @Input() public get Repository():Repository<Model>{
        if (this.__repository === undefined) throw new Error(``);
        return this.__repository;
    }
    public set Repository(value:Repository<Model>){
        this.__repository = value;          
    }
    public get Table():{Properties:Schema.Property[], Models:Model[] }{
        var result = { Properties:this.Repository.Schema.Properties, Models:this.Repository.Items }
        result.Properties = result.Properties.filter(x => {return !(x.PropertyType instanceof Schema.Model) });
        result.Properties = result.Properties.filter(x => {return x.PropertyType.Name !== "Collection"});
        return result;
    }

    public Create(){

    }
    public Select(model:Model){
        if (this.ContextControl.Tree !== undefined)
            this.ContextControl.Tree.Current.Child = new ContextNode(model);
    }


    public get Visible():boolean{
        if (this.ContextControl.Tree !== undefined){
            if (this.ContextControl.Tree.Current !== undefined){
                return (this.ContextControl.Tree.Current.Item === this.Repository);
            }
        }
        return false;
    }

    public Log(item:any){
        console.log(item);
    }
}