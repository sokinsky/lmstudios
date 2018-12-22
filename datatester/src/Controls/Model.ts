import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { Model, Repository, Schema } from "@lmstudios/data";
import { ContextControl } from "./Context";

@Component({
    selector:"model-control",
    templateUrl:"Model.html",
    styleUrls:["Model.css"]
})
export class ModelControl implements OnInit {
	constructor() { }
    public async ngOnInit(){
    }
    @Input() ctlContext?:ContextControl;   
    @Input() Value?:Model;
    public get Visible():boolean{
        return this.Value !== undefined;
    }  
    @Output() public modelSelected:EventEmitter<Model> = new EventEmitter();
    public selectModel(model:Model){
        if (this.Selecting !== undefined){

        }
        else{
            this.modelSelected.emit(model);
        }
        
    }
    public Selecting?:{Repository:Repository<Model>, Property:Schema.Property};

    public get dataProperties():Schema.Property[]{
        if (this.Value === undefined)
            return [];
        return this.Value.GetSchema().Properties.filter(x => { return (! (x.PropertyType instanceof Schema.Model) &&  x.PropertyType.Name !== "Collection" )});
    }
    public get modelProperties():Schema.Property[]{
        if (this.Value === undefined)
            return []
        return this.Value.GetSchema().Properties.filter(x => { return x.PropertyType instanceof Schema.Model; })
    }
    public get collectionProperies():Schema.Property[]{
        if (this.Value === undefined)
            return []
        return this.Value.GetSchema().Properties.filter(x => { return x.PropertyType.Name === "Collection"; })
    }  

    public AddModel(property:Schema.Property){
        if (this.ctlContext !== undefined){
            if (this.ctlContext.Value !== undefined){
                this.Selecting = {
                    Repository:this.ctlContext.Value.GetRepository(property.PropertyType),
                    Property:property
                };
            }
        }
        console.log(this.Selecting);
    }

    
    public Log(item:any){
        console.log(item);
    }
    public Json(item:any):string{
        if (item instanceof Model)
            return JSON.stringify(item.__controller.Values.Actual.Data, null, "\t");
        return JSON.stringify(item, null, "\t");
    }
}