import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { Model, Repository, Schema, ChangeStatus } from "@lmstudios/data";
import { ContextControl, ContextNode } from "./Context";
import { modelGroupProvider } from "@angular/forms/src/directives/ng_model_group";

@Component({
    selector:"model-control",
    templateUrl:"Model.html",
    styleUrls:["Model.css"]
})
export class ModelControl implements OnInit {
	constructor() { }
    public async ngOnInit(){
    }
    private __contextControl?:ContextControl;
    public get ContextControl():ContextControl{
        if (this.__contextControl === undefined)
            throw new Error(``);
        return this.__contextControl;
    }
    @Input() public set ContextControl(value:ContextControl){
        this.__contextControl = value;
    }
    public get Visible():boolean{
        if (this.ContextControl.Tree !== undefined){
            if (this.ContextControl.Tree.Current !== undefined){
                return (this.ContextControl.Tree.Current.Item instanceof Model);
            }
        }
        return false;
    }
    public get Model():Model{
        if (this.ContextControl.Tree !== undefined){
            if (this.ContextControl.Tree.Current !== undefined){
                if (this.ContextControl.Tree.Current.Item instanceof Model)
                    return <Model>this.ContextControl.Tree.Current.Item
            }
        }
        throw new Error(``);
    }
    public get Label():string{
        if (this.ContextControl.Tree !== undefined)
            return this.generateLabel(this.ContextControl.Tree.Root);
        throw new Error(``);   
    }
    public generateLabel(node:ContextNode, result?:string):string{
        if (result == undefined)
            result = "";

        if (node.Item instanceof Model)
            result += `${node.Item.toString()}.`
        else if (node.Item instanceof Repository)
            result += `${node.Item.Name}.`

        if (node.Child === undefined)
            return result.replace(/\.$/, "");
        else
            return this.generateLabel(node.Child, result);
    }
    public OK(){

    }
    public Cancel(){

    }

    public get ChangeStatus():string {
        var result = this.Model.__controller.Status.Change.Model;
        if (result !== undefined)
            return result.toString();
        return "";
    }

    public Undo(){           
        this.Model.Undo();
    }

    public get Properties():Schema.Property[]{
        if (this.Model === undefined)
            return [];
        var result = this.Model.GetSchema().Properties;
        // result = result.filter(x => {return ! (x.PropertyType instanceof Schema.Model)});
        // result = result.filter(x => {return x.PropertyType.Name !== "Collection"});
        return result;
    }

    
    public Log(item:any){
        console.log(item);
    }
    public Json(item:any):string{
        if (item instanceof Model)
            return JSON.stringify(item.__controller.Values.Actual.Data, null, "\t");
        return JSON.stringify(item, null, "\t");
    }
}