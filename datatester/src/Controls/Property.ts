import { Component, OnInit, Input, Output, EventEmitter, SchemaMetadata } from "@angular/core";
import { Repository, Collection, Model, Schema } from "@lmstudios/data";
import { ModelControl, ModelTree, ModelNode, ContextControl } from "./";
import { ThrowStmt } from "@angular/compiler";

@Component({
    selector:"property-control",
    templateUrl:"Property.html"
})
export class PropertyControl {

    private __modelControl?:ModelControl;
    public get ModelControl():ModelControl{
        if (this.__modelControl === undefined)
            throw new Error(``);
        return this.__modelControl;
    } 
    @Input() public set ModelControl(value:ModelControl){
        this.__modelControl = value;
    }

    private __property?:Schema.Property;
    public get Property():Schema.Property{
        if (this.__property === undefined)
            throw new Error(``);
        return this.__property;
    }
    @Input() public set Property(value:Schema.Property){
        if (this.__property !== value){
            this.__property = value; 
            this.propertyChanged(value);
        }             
    }
    public propertyChanged(value:Schema.Property){

    }
    public get ActiveNode():ModelNode{
        if (this.ModelControl.ContextControl.SelectedModel !== undefined)
            return this.ModelControl.ContextControl.SelectedModel.ActiveNode;
        throw new Error(``);
    }
    public get ActiveModel():Model{
        return this.ActiveNode.Model;
    }



    public ToggleState:string = "Open";
    public Toggle(){
        switch (this.ToggleState){
            case "Open":
                this.ToggleState = "Closed";
                break;
            case "Closed":
                this.ToggleState = "Open";
                break;
        }
    }
    public get ChangeState():string {
        var propertyState = this.ModelControl.Model.__controller.Status.Change.Properties[this.Property.Name];
        if (propertyState === undefined)
            return "Unchanged";
        return propertyState.toString();
    }
    public Log(item:any){
        console.log(item);
    }
    public get Type():string{
        if (this.Property.PropertyType instanceof Schema.Model)
            return "Model";
        else if (this.Property.PropertyType.Name == "Collection")
            return "Collection";
        else
            return "Data";        
    }


}