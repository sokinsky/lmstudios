import { Component, Input } from "@angular/core";
import * as LMSData from "@lmstudios/data";

@Component({
    selector:"lms-data-context",
    template:`
        <div *ngIf="visible">Context</div>
    `
})
export class Context {
    @Input() public data?:LMSData.Context;
    public get visible():boolean{
        return this.data !== undefined;
    }
}