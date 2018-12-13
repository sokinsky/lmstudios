import { Component, OnInit } from "@angular/core";
import { Context as Data } from "../STA/Data/Context";
import { Repository } from "./Repository";

@Component({
    selector:"context-control",
    templateUrl:"Context.html",
    styleUrls:["Context.css"]
})
export class Context implements OnInit {
	constructor(private data: Data) {
    }
    public async ngOnInit(){
        console.log(this.data.Repositories.length);
    }

    public selectedRepository?:Repository;

    public Log(item:any){
        console.log(item);
    }
}