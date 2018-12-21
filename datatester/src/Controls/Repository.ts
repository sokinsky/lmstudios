import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { Repository, Model } from "@lmstudios/data";
import { ContextControl } from "./Context";

@Component({
    selector:"repository-control",
    templateUrl:"Repository.html",
    styleUrls:["Repository.css"]
})
export class RepositoryControl implements OnInit {
	constructor() { 
        this.search = {
            Active:false,
            String:"",
            Filter:undefined,
            Rows:3
        }
    }
    public async ngOnInit(){
        if (this.search.Filter === undefined && this.Value !== undefined)
            this.SearchResults = this.Value.Items
    }

    @Input() public ctlContext?:ContextControl; 
    @Input() public Value?:Repository<Model>;

    public get Visible():boolean{
        if (this.ctlContext !== undefined && this.Value !== undefined){
            if (this.ctlContext.SelectedRepository !== undefined){
                if (this.ctlContext.SelectedRepository === this.Value){
                     return true;
                }
            }
        }
        return false;
    }
    public search:{
        Active:boolean,
        String:string,
        Filter:any,
        Rows:number
    }

    public SearchResults:Model[] = [];
    @Output() public modelSelected:EventEmitter<Model> = new EventEmitter();

    public Log(item:any){
        console.log(item);
    }
    public blurSearch(){
        try {
            this.search.Filter = JSON.parse(this.search.String);
            this.search.String = JSON.stringify(this.search.Filter, null, "\t");
            this.search.Rows = this.search.String.split('\n').length;
        }
        catch {
            console.log("Invalid JSON");
        }
    }

    public Search(){
        if (this.Value !== undefined){
            this.Value.Search(this.search.Filter).then(results=>{
                this.SearchResults = results;
            })
        }
    }
    public Select(){
        if (this.Value !== undefined){
            this.Value.Select(this.search.Filter).then(result=>{
                if (result !== undefined)
                    this.modelSelected.emit(result);
            })
        }
    }
}