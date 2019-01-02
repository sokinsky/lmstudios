import { Component, OnInit, Input, Output, EventEmitter, SchemaMetadata } from "@angular/core";
import { Repository, Model, Schema } from "@lmstudios/data";
import { ModelControl, PropertyControl } from "../";


@Component({
    selector:"data-property-control",
    templateUrl:"Data.html",
    styleUrls:["Data.css"]
})
export class DataPropertyControl extends PropertyControl implements OnInit {
    public async ngOnInit(){
    }
}