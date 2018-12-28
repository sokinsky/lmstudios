import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { Repository, Model, Schema } from "@lmstudios/data";
import { ContextControl } from "./Context";
import { unescapeIdentifier, ThrowStmt } from "@angular/compiler";
import { provideRouterInitializer } from "@angular/router/src/router_module";

@Component({
    selector:"repository-control",
    templateUrl:"Repository.html",
    styleUrls:["Repository.css"]
})
export class RepositoryControl implements OnInit {
	constructor() { 
    }
    public async ngOnInit(){
    }

    private __ctlContext?:ContextControl
    public get ctlContext():ContextControl{
        if (this.__ctlContext === undefined) throw new Error(``);
        return this.__ctlContext;
    }
    @Input() public set ctlContext(value:ContextControl){
        this.__ctlContext = value;
    }
    private __value?:Repository<Model>;
    @Input() public get Value():Repository<Model>{
        if (this.__value === undefined) throw new Error(``);
        return this.__value;
    }
    public set Value(value:Repository<Model>){
        this.__value = value;
        this.Items = this.__value.Items;                
    }
    @Output() public selected:EventEmitter<Model> = new EventEmitter();

    private __items:Model[] = [];
    public get Items():Model[]{
        return this.__items;
    }
    public set Items(values:Model[]){
        this.__items = values;
        this.Table = { Columns:[], Rows:[] };
        for (var property of this.Value.Schema.Properties){
            if ( !( property.PropertyType instanceof Schema.Model) && !(property.PropertyType.Name === "Collection")){
                this.Table.Columns.push({Name:property.Name, Type:property.PropertyType.Name});
            }
        }
        for (var model of values){
            var row = {};
            for (var column of this.Table.Columns){
                var property = this.Value.Schema.GetProperty(column.Name);
                if (property !== undefined)
                    property.SetValue(row, property.GetValue(model));
            }
            this.Table.Rows.push(row);
        }
        console.log(this.Table);
    }

    public Table:{
        Columns:{Name:string, Type:string }[],
        Rows:any[]
    } = { Columns:[], Rows:[] }
    public Tools:{
        Search: { Active:boolean, Input:string }
    } = {
        Search: { Active:false, Input:"" }
    }

    public get Visible():boolean{
        return (this.__ctlContext !== undefined && this.__value !== undefined);
    }

    public Log(item:any){
        console.log(item);
    }
    // public createSearch():{ Active:boolean, Input?:string, Filter?:any, Rows?:number, Error?:string }{
    //     var filter = {};
    //     if (this.Value !== undefined){
    //         for (var property of this.Value.Schema.Properties){                
    //             if (property.Relationship === undefined){
    //                 property.SetValue(filter, undefined);
                    
    //             }
    //         }
    //     }
    //     var input = JSON.stringify(filter, function(k, v) { return v === undefined ? null : v; }, "\t");
    //     input = input.replace(/null/g, "undefined");
    //     var rows = input.split('\n').length;
    //     return { Active:true, Input:input, Filter:filter, Rows:rows }
    // }
    // public searchChange(){
    //     if (this.Search === undefined)
    //         this.Search = this.createSearch();
    //     var input = this.Search.Input;
    //     var tempFilter:any = {};
    //     var filter:any = {};
    //     if (input !== undefined){
    //         input = input.replace(/:\s*undefined\s*,/g, ":\"[undefined]\",");
    //         input = input.replace(/:\s*undefined\s*}/g, ":\"[undefined]\"}");
    //         try{
    //             var tempFilter = JSON.parse(input);
    //             var propertyCount = 0;
    //             for (var property in tempFilter){
    //                 if (tempFilter[property] != "[undefined]"){
    //                     propertyCount++;
    //                     filter[property] = tempFilter[property]; 
    //                 }                        
    //             }
    //             if (propertyCount > 0)
    //                 this.LocalSearch(filter);
    //             else
    //                 this.LocalSearch(undefined);
    //         }
    //         catch{
    //             this.Search.Error = "Invalid:Json format";
    //         }
    //     }
    // }

    // public Select(model:Model){
    //     this.modelSelected.emit(model);
    // }
    // public New(){
    //     if (this.Value !== undefined){
    //         var model = this.Value.Add({});
    //         this.modelSelected.emit(model);
    //     }            
    // }

    // public Edit(){
    //     console.log("Edit");
    // }
    // public Open(){
    //     console.log("Open");
    // }
    // public Create(){
    //     console.log("Create");
    // }


    // public ServerSearch(){
    //     if (this.Search === undefined || this.Search.Filter === undefined)
    //         return;
    //     var filter:any = {};
    //     var propertyCount:number = 0;
    //     for(var property in this.Search.Filter){            
    //         if (this.Search.Filter[property] !== undefined){
    //             propertyCount++;
    //             filter[property] = this.Search.Filter[property];
    //         }                
    //     }
    //     if (propertyCount == 0)
    //         filter = undefined;
    //     if (filter !== undefined){
    //         if (this.Value !== undefined){
    //             this.Value.Search(filter).then(results=>{
    //                 this.Results = results;
    //             })
    //         }
    //     }        
    // }
    // public LocalSearch(filter:any){
    //     if (filter !== undefined){            
    //         if (this.Value !== undefined)
    //             this.Results = this.Value.Local.Search(filter);            
    //     }     
    //     else if (this.Value !== undefined){
    //         this.Results = this.Value.Items;
    //     }       
    // }
}