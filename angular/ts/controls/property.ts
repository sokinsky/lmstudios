import { Component, Input } from "@angular/core";
import * as LMSData from "@lmstudios/data";
import { control, controls } from "../";


@Component({
    selector:"lmsdata-property",
    templateUrl:"../../html/controls/property.html"
})
export class property {
    @Input() public value?:LMSData.Schema.Property;
}