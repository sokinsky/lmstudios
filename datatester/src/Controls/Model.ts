import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { Model, Repository, Schema, ChangeStatus } from "@lmstudios/data";
import { ContextControl } from "./Context";

@Component({
    selector:"model-control",
    templateUrl:"Model.html",
    styleUrls:["Model.css"]
})
export class ModelControl implements OnInit {
	constructor() { }
    public async ngOnInit(){
    }
    private __parent?:ContextControl;
    public get parent():ContextControl{
        if (this.__parent === undefined)
            throw new Error(``);
        return this.__parent;
    }
    @Input() public set parent(value:ContextControl){
        this.__parent = value;
    }

    private __model?:Model;
    public get model():Model{
        if (this.__model === undefined)
            throw new Error(``);
        return this.__model;
    }
    @Input() public set model(value:Model){
        this.__model = value;
    }

    public get Visible():boolean{
        return (this.__model !== undefined && this.parent.SelectedItem === this.model);
    }

    public OK(){

    }
    public Cancel(){

    }

    public get ChangeStatus():string {
        var result = this.model.__controller.Status.Change.Model;
        if (result !== undefined)
            return result.toString();
        return "";
    }

    public Undo(){           
        this.model.Undo();
    }

    public get dataProperties():Schema.Property[]{
        if (this.model === undefined)
            return [];
        return this.model.GetSchema().Properties.filter(x => { return (! (x.PropertyType instanceof Schema.Model) &&  x.PropertyType.Name !== "Collection" )});
    }
    public get modelProperties():Schema.Property[]{
        if (this.model === undefined)
            return []
        return this.model.GetSchema().Properties.filter(x => { return x.PropertyType instanceof Schema.Model; })
    }
    public get collectionProperties():Schema.Property[]{
        if (this.model === undefined)
            return []
        return this.model.GetSchema().Properties.filter(x => { return x.PropertyType.Name === "Collection"; })
    }  

    public AddModel(property:Schema.Property){
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