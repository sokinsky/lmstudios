import { Component, OnInit, Input, Output, EventEmitter, SchemaMetadata } from "@angular/core";
import { Repository, Model, Schema } from "@lmstudios/data";
import { ModelControl } from "../Model";

@Component({
    selector:"model-property-control",
    templateUrl:"Model.html",
    styleUrls:["Model.css"]
})
export class ModelPropertyControl implements OnInit {
	constructor() { 
    }
    public async ngOnInit(){
    }

    private __parent?:ModelControl;
    public get parent():ModelControl{
        if (this.__parent === undefined)
            throw new Error(``);
        return this.__parent;
    } 
    @Input() public set parent(value:ModelControl){
        this.__parent = value;
    }
    
    private __property?:Schema.Property;
    public get property():Schema.Property{
        if (this.__property === undefined)
            throw new Error(``);
        return this.__property;
    }
    @Input() public set property(value:Schema.Property){
        this.__property = value;  
        if (this.__property !== undefined){
            if ( !(this.__property.PropertyType instanceof Schema.Model))
                throw new Error("Invalid Property");
        }
    }

    public State:string = "Closed";
    public toggleState(){
        switch (this.State){
            case "Closed":
                this.State = "Open";
                break;
            case "Open":
                this.State = "Closed";
                break;
            default:
                this.State = "Closed";
                break;
        }
    }
    

    public get ChangeStatus():string{
        if (this.parent.model.__controller.Status.Change.Properties[this.property.Name] === undefined)
            return "Unchanged";
        return this.parent.model.__controller.Status.Change.Properties[this.property.Name].toString();
    }
    public Undo(){
        this.parent.model.Undo(this.property);
    }    

    public Add(){
        var repo = this.parent.model.__context.GetRepository(this.property.PropertyType);
        this.parent.parent.Select(repo);
    }
    public editModel(){
    }
    public changeModel(){

    }
    

    public Log(item:any){
        console.log(item);
    }


}