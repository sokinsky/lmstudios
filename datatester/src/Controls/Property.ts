import { Component, OnInit, Input, Output, EventEmitter, SchemaMetadata } from "@angular/core";
import { Repository, Model, Schema } from "@lmstudios/data";
import { ModelControl } from "./Model";
import { lchmodSync } from "fs";

@Component({
    selector:"property-control",
    templateUrl:"Property.html",
    styleUrls:["Property.css"]
})
export class PropertyControl implements OnInit {
	constructor() { 
    }
    public async ngOnInit(){
    }

    private __parent?:ModelControl;
    @Input() public get parent():ModelControl{
        if (this.__parent === undefined)
            throw new Error(``);
        return this.__parent;
    } 
    public set parent(value:ModelControl){
        this.__parent = value;
    }
    
    private __property?:Schema.Property;
    @Input() public get property():Schema.Property{
        if (this.__property === undefined)
            throw new Error(``);
        return this.__property;
    }
    public set property(value:Schema.Property){
        this.__property = value;  
    }

    public get Display():{Type:string}{
        var result:{Type:string} = {Type:"none"};
        if (this.property.PropertyType instanceof Schema.Model)
            result.Type = "Model"
        else if (this.property.PropertyType.Name === "Collection")
            result.Type = "Collection"
        else
            result.Type = "Data";
        return result;
    }
    public State:string = "Open";
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