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
    public Display:{
        Type:string
    } = { Type:"unknown"}

    private __ctlModel?:ModelControl;
    @Input() public get ctlModel():ModelControl{
        if (this.__ctlModel === undefined)
            throw new Error(``);
        return this.__ctlModel;
    } 
    public set ctlModel(value:ModelControl){
        this.__ctlModel = value;
    }
    
    private __value?:Schema.Property;
    @Input() public get Value():Schema.Property{
        if (this.__value === undefined)
            throw new Error(``);
        return this.__value;
    }
    public set Value(value:Schema.Property){
        this.__value = value;  
        if (value.PropertyType instanceof Schema.Model)
            this.Display.Type = "Model";
        else if (value.PropertyType.Name === "Collection" && value.PropertyType.GenericTypes !== undefined && value.PropertyType.GenericTypes.length == 1 && value.PropertyType.GenericTypes[0] instanceof Schema.Model)
            this.Display.Type = "Collection";
        else
            this.Display.Type = "Data";
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
        if (this.ctlModel.Value.__controller.Status.Change.Properties[this.Value.Name] === undefined)
            return "Unchanged";
        return this.ctlModel.Value.__controller.Status.Change.Properties[this.Value.Name].toString();
    }
    public Undo(){
        this.ctlModel.Value.Undo(this.Value);
    }    

    public addModel(){
        this.ctlModel.ctlContext.selectRepository()
    }
    public editModel(){
        this.ctlModel.selectModel(this.Value.GetValue(this.ctlModel.Value));
    }
    public changeModel(){

    }
    

    public Log(item:any){
        console.log(item);
    }


}