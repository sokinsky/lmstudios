import { Component, OnInit, Input, Output, EventEmitter, ViewChildren, ViewChild } from "@angular/core";
import { Repository, Model, Schema } from "@lmstudios/data";
import { ModelControl } from "./Model";


@Component({
    selector:"menuitem",
    templateUrl:"MenuItem.html",
    styleUrls:["MenuItem.css"]
})
export class MenuItem {
    constructor(name:string){
        this.Name = name;
    }
    public Name:string;

}