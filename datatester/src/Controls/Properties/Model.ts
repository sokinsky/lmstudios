import { Component, OnInit, Input, Output, EventEmitter, SchemaMetadata } from "@angular/core";
import { Repository, Model, Schema } from "@lmstudios/data";
import { ModelControl, PropertyControl } from "../";

@Component({
    selector:"model-property-control",
    templateUrl:"Model.html",
    styleUrls:["Model.css"]
})
export class ModelPropertyControl extends PropertyControl {
    constructor(){super();console.log(this);}

}