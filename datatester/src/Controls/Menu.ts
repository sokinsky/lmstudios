import { Component, OnInit, Input, Output, EventEmitter, ViewChildren, ViewChild, QueryList } from "@angular/core";
import { Repository, Model, Schema } from "@lmstudios/data";
import { MenuItem } from "./MenuItem";

@Component({
    selector:"menu",
    templateUrl:"Menu.html",
    styleUrls:["Menu.css"]
})
export class Menu implements OnInit {
	constructor() { 
    }
    public async ngOnInit(){
    } 
    @ViewChildren(MenuItem) public Items!:QueryList<MenuItem>;
}
