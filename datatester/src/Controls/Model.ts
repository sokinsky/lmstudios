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
    private __ctlContext?:ContextControl;
    public get ctlContext():ContextControl{
        if (this.__ctlContext === undefined)
            throw new Error(``);
        return this.__ctlContext;
    }
    @Input() public set ctlContext(value:ContextControl){
        this.__ctlContext = value;
    }
    private __value?:Model;
    public get Value():Model{
        if (this.__value === undefined)
            throw new Error(``);
        return this.__value;
    }
    @Input() public set Value(value:Model){
        this.__value = value;
    }

    public get Visible():boolean{
        return this.__value !== undefined;
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

    public get ChangeStatus():string {
        if (this.Value.__controller.Status.Change.Model !== undefined)
            return this.Value.__controller.Status.Change.Model.toString();
        return "";
    }
    public get ServerStatus():string{
        if (this.Value.__controller.Status.Server.Model !== undefined)
            return this.Value.__controller.Status.Server.Model.toString();
        return "Unserved";
    }

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