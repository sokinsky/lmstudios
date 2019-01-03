import { Component, OnInit, Input, Output, EventEmitter, SchemaMetadata } from "@angular/core";
import { Repository, Model, Schema } from "@lmstudios/data";
import { ContextControl, ModelControl, ModelTree, ModelNode, PropertyControl } from "../";

@Component({
    selector:"model-property-control",
    templateUrl:"Model.html",
    styleUrls:["Model.css"]
})
export class ModelPropertyControl extends PropertyControl {
    constructor(){
        super();
        this.ToggleState = "Closed";
    }
    public Add(){
        this.ActiveNode.Add(this.Property);
    }
    public Select(){
        this.ActiveNode.Property = this.Property;
    }
}