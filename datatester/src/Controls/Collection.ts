import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { Repository, Model, Schema } from "@lmstudios/data";
import { ModelControl } from "./Model";

@Component({
    selector:"collection-control",
    templateUrl:"Collection.html",
    styleUrls:["Collection.css"]
})
export class CollectionControl implements OnInit {
	constructor() { 
    }
    public async ngOnInit(){
    }

    @Input() public ctlModel?:ModelControl; 
    @Input() public parentValue?:Model;
    @Input() public parentProperty?:Schema.Property
    
    @Output() public modelSelected:EventEmitter<Model> = new EventEmitter();

    public search:{
        String:string,
        Filter:undefined,
        Rows:number
    } = { String:"", Filter:undefined, Rows:1 }
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
    public SearchResults:Model[] = [];
    public Search(){
        if (this.parentValue !== undefined){
            if (this.parentProperty !== undefined){
                var repository = this.parentValue.__context.GetRepository(this.parentProperty.PropertyType);
                repository.Search(this.search.Filter).then(results=>{
                    this.SearchResults = results;
                })
            }      

        }
    }
    public Create(){
        if (this.parentValue !== undefined){
            if (this.parentProperty !== undefined){
                var repository = this.parentValue.__context.GetRepository(this.parentProperty.PropertyType);
                var result = repository.Add({});
                this.parentValue.SetValue(this.parentProperty, result)
                this.modelSelected.emit(result);
            }      

        }
    }
}