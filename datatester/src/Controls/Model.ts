import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { Model, Collection, Schema } from "@lmstudios/data";
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
        console.log(model);
        this.modelSelected.emit(model);
    }

    public ActiveSelectors:{[name:string]:boolean} = {};

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
        this.ActiveSelectors[property.Name] = true;
    }
    public NewModel(property:Schema.Property){
        if (this.Value !== undefined){
            this.Value.SetValue(property, {});
        }
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