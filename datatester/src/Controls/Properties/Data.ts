import { Component, OnInit, Input, Output, EventEmitter, SchemaMetadata } from "@angular/core";
import { Repository, Model, Schema } from "@lmstudios/data";
import { ModelControl, PropertyControl } from "../";


@Component({
    selector:"data-property-control",
    templateUrl:"Data.html",
    styleUrls:["Data.css"]
})
export class DataPropertyControl extends PropertyControl {
    public propertyChanged(value:Schema.Property){
        if (value.Required){ 
            this.ToggleState = 'Open';
            if (value === value.Model.PrimaryKeyProperty){
                this.ToggleState = 'Locked'
            }
        }
        else{
            this.ToggleState = 'Closed';
        }
        
    }
}