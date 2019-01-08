import { Component, OnInit, Input, Output, EventEmitter, SchemaMetadata } from "@angular/core";
import * as LMS from "@lmstudios/data";
import { ModelControl, PropertyControl } from "../";


@Component({
    selector:"data-property-control",
    templateUrl:"Data.html",
    styleUrls:["Data.css"]
})
export class DataPropertyControl extends PropertyControl {
    public propertyChanged(value:LMS.Data.Schema.Property){
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