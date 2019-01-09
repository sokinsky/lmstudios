import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import * as LMSData from "@lmstudios/data";
import { control, controls } from "../";

@Component({
    selector:"lmsdata-model-control",
    templateUrl:"../../html/controls/model.html",
    styleUrls:["../../html/controls/model.css"]
})
export class model extends control {
}
