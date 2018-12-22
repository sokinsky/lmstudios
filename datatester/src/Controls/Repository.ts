import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { Repository, Model, Schema } from "@lmstudios/data";
import { ContextControl } from "./Context";
import { unescapeIdentifier, ThrowStmt } from "@angular/compiler";

@Component({
    selector:"repository-control",
    templateUrl:"Repository.html",
    styleUrls:["Repository.css"]
})
export class RepositoryControl implements OnInit {
	constructor() { 
    }
    public async ngOnInit(){
        if (this.Value !== undefined)
            this.Results = this.Value.Items
    }

    @Input() public ctlContext?:ContextControl; 
    private __value?:Repository<Model>;
    @Input() public get Value():Repository<Model>|undefined{
        return this.__value;
    }
    public set Value(value:Repository<Model>|undefined){
        if (this.__value === value)
            return;
        this.__value = value;
        if (this.__value !== undefined){
            this.Results = this.__value.Items;
        }        
    }
    @Output() public modelSelected:EventEmitter<Model> = new EventEmitter();

    public get Visible():boolean{
        if (this.ctlContext !== undefined && this.Value !== undefined)
            return true;
        return false;
    }
    public selectTool(tool:string){
        switch (tool){
            case "Search":
                if (this.Search === undefined)
                    this.Search = this.createSearch();
                else
                    this.Search.Active = !this.Search.Active;
                break;
        }
    }
    public Search?:{ Active:boolean, Input?:string, Filter?:any, Rows?:number, Error?:string }
    private __results:Model[] = [];
    public get Results():Model[]{
        return this.__results;
    }
    public set Results(value:Model[]){
        this.__results = value;
        if (value === undefined)
            this.Display = undefined;
        if (this.Value !== undefined){
            this.Display = { Header:[], Body:[] };
            for (var property of this.Value.Schema.Properties){
                if (property.Relationship === undefined){
                    this.Display.Header.push(property);
                }                    
            }
            for (var model of value){
                this.Display.Body.push(model);
            }
        }
    }
    public Display?:{Header:Schema.Property[], Body:Model[]};

    

    public Log(item:any){
        console.log(item);
    }
    public createSearch():{ Active:boolean, Input?:string, Filter?:any, Rows?:number, Error?:string }{
        var filter = {};
        if (this.Value !== undefined){
            for (var property of this.Value.Schema.Properties){                
                if (property.Relationship === undefined){
                    property.SetValue(filter, undefined);
                    
                }
            }
        }
        var input = JSON.stringify(filter, function(k, v) { return v === undefined ? null : v; }, "\t");
        input = input.replace(/null/g, "undefined");
        var rows = input.split('\n').length;
        return { Active:true, Input:input, Filter:filter, Rows:rows }
    }
    public searchChange(){
        if (this.Search === undefined)
            this.Search = this.createSearch();
        var input = this.Search.Input;
        var tempFilter:any = {};
        var filter:any = {};
        if (input !== undefined){
            input = input.replace(/:\s*undefined\s*,/g, ":\"[undefined]\",");
            input = input.replace(/:\s*undefined\s*}/g, ":\"[undefined]\"}");
            try{
                var tempFilter = JSON.parse(input);
                var propertyCount = 0;
                for (var property in tempFilter){
                    if (tempFilter[property] != "[undefined]"){
                        propertyCount++;
                        filter[property] = tempFilter[property]; 
                    }                        
                }
                if (propertyCount > 0)
                    this.LocalSearch(filter);
                else
                    this.LocalSearch(undefined);
            }
            catch{
                this.Search.Error = "Invalid:Json format";
            }
        }
    }

    public Edit(){
        console.log("Edit");
    }
    public Open(){
        console.log("Open");
    }
    public Create(){
        console.log("Create");
    }


    public ServerSearch(){
        if (this.Search === undefined || this.Search.Filter === undefined)
            return;
        var filter:any = {};
        var propertyCount:number = 0;
        for(var property in this.Search.Filter){            
            if (this.Search.Filter[property] !== undefined){
                propertyCount++;
                filter[property] = this.Search.Filter[property];
            }                
        }
        if (propertyCount == 0)
            filter = undefined;
        if (filter !== undefined){
            if (this.Value !== undefined){
                this.Value.Search(filter).then(results=>{
                    this.Results = results;
                })
            }
        }        
    }
    public LocalSearch(filter:any){
        if (filter !== undefined){            
            if (this.Value !== undefined)
                this.Results = this.Value.Local.Search(filter);            
        }     
        else if (this.Value !== undefined){
            this.Results = this.Value.Items;
        }       
    }
}