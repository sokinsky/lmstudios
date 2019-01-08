import { Component, OnInit, Input, Output, EventEmitter, SchemaMetadata } from "@angular/core";
import * as LMSData from "@lmstudios/data";
import { ModelControl, ModelTree, ModelNode, ContextControl } from "./";

@Component({
    selector:"lmscontrol-property",
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

    private __property?:LMSData.Schema.Property;
    public get Property():LMSData.Schema.Property{
        if (this.__property === undefined)
            throw new Error(``);
        return this.__property;
    }
    @Input() public set Property(value:LMSData.Schema.Property){
        if (this.__property !== value){
            this.__property = value; 
            this.propertyChanged(value);
        }             
    }
    public propertyChanged(value:LMSData.Schema.Property){

    }
    public get ActiveNode():ModelNode{
        if (this.ModelControl.ContextControl.SelectedModel !== undefined)
            return this.ModelControl.ContextControl.SelectedModel.ActiveNode;
        throw new Error(``);
    }
    public get ActiveModel():LMSData.Model{
        return this.ActiveNode.Model;
    }

    public get Error():any{
        if (this.ActiveModel.__controller.Error !== undefined){
            if (this.ActiveModel.__controller.Error.InnerErrors !== undefined)
                return (this.ActiveModel.__controller.Error.InnerErrors[this.Property.Name] !== undefined);
        }
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
        if (this.Property.PropertyType instanceof LMSData.Schema.Model)
            return "Model";
        else if (this.Property.PropertyType.Name == "Collection")
            return "Collection";
        else
            return "Data";        
    }


}