import { Component, OnInit, Input } from "@angular/core";
import { Repository as Data } from "@lmstudios/data";
import { Model } from "../STA/Data";

@Component({
    selector:"repository-control",
    templateUrl:"Repository.html",
    styleUrls:["Repository.css"]
})
export class Repository implements OnInit {
	constructor() { }
    public async ngOnInit(){
    }

    private __repository:Data<Model>|undefined;
    public get repository():Data<Model>|undefined{
        return this.__repository;
    }
    @Input()public set repository(value:Data<Model>|undefined){
        if (this.__repository !== value){
            this.__repository = value;
            this.__selectedModel = undefined;
        }
    }

    private __selectedModel?:Model;
    public get selectedModel():Model|undefined{
        return this.__selectedModel;
    }
    public set selectedModel(value:Model|undefined){
        this.__selectedModel = value;
    }
    
    private __searchString:string = "";
    public get searchString():string{
        return this.__searchString;
    }
    public set searchString(value:string){
        this.__searchString = value;
    }
    public searchRows:number = 3;
    public searchFilter:any;

    public Create(){
        if (this.__repository !== undefined){
            this.selectedModel = this.__repository.Create();
        }            
    }

    public Log(item:any){
        console.log(item);
    }
    public blurSearch(){
        try {
            var filter = JSON.parse(this.__searchString);
            this.searchString = JSON.stringify(filter, null, "\t");
            this.searchRows = this.searchString.split('\n').length;
        }
        catch {
            console.log("Invalid JSON");
        }
    }
}