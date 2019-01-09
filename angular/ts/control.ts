import { Component, OnInit, AfterViewInit, Input, ViewChild, ViewChildren, QueryList, forwardRef, SchemaMetadata} from "@angular/core";
import * as LMSData from "@lmstudios/data";

@Component({
    selector:"lmsdata-control",
    templateUrl:"../html/control.html",
    styleUrls:["../css/control.css"],
    
})
export class control {
	constructor() {
    }
    
    private __parent!:control;
    public get parent():control{
        return this.__parent;
    }
    @Input() public set parent(value:control){
        this.__parent = value;
    }

    


    public Log(item:any){
        console.log(item);
    }
}
