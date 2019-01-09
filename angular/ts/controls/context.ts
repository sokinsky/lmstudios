import { Component, Input } from "@angular/core";
import * as LMSData from "@lmstudios/data";
import { control } from "../";

@Component({
    selector:"lmsdata-context-control",
    templateUrl:"~/html/controls/context.html",
    styleUrls:["~/css/controls/contex.css"],
    
})
export class context {
    @Input() value?:LMSData.Context;
}
