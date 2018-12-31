import { Component, OnInit, Input, Output, EventEmitter, SchemaMetadata } from "@angular/core";
import { Repository, Collection, Model, Schema } from "@lmstudios/data";
import { ModelControl } from "../Model";
import { ThrowStmt } from "@angular/compiler";

@Component({
    selector:"collection-property-control",
    templateUrl:"Collection.html",
    styleUrls:["Collection.css"]
})
export class CollectionPropertyControl implements OnInit {
	constructor() { 
    }
    public async ngOnInit(){
    }

    private __parent?:ModelControl;
    public get parent():ModelControl{
        if (this.__parent === undefined)
            throw new Error(``);
        return this.__parent;
    } 
    @Input() public set parent(value:ModelControl){
        this.__parent = value;
    }
    
    private __property?:Schema.Property;
    public get property():Schema.Property{
        if (this.__property === undefined)
            throw new Error(``);
        return this.__property;
    }
    @Input() public set property(value:Schema.Property){
        this.__property = value;  
        if (this.__property !== undefined){
            if ( this.__property.PropertyType.Name !== "Collection")
                throw new Error(`Invalid Property(${this.__property.PropertyType.Name})`);
        }
    }

    public __table:{
        Columns:{Name:string, Type:string }[],
        Rows:Model[]
    } = { Columns:[], Rows:[] }
    public get Table():{Columns:Schema.Property[], Rows:Model[] }{
        var result:{Columns:Schema.Property[], Rows:Model[]} = {Columns:[], Rows:[]};
        var collection:Collection<Model> = <Collection<Model>>this.property.GetValue(this.parent.model);        
        var properties:Schema.Property[] = [];
        properties.push(collection.Child.Schema.PrimaryKeyProperty);
        for (var property of collection.Child.Schema.Properties){ 
            if (property.References === undefined){
                if (! properties.find(x => x === property))
                    properties.push(property);
            }
        }
        result.Columns = properties.sort((x,y)=>{
            if (x.Relationship === undefined && y.Relationship !== undefined) return -1;
            if (x.Relationship !== undefined && y.Relationship === undefined) return 1;
            return 0;
        });
        result.Rows = collection.Items;
        
        return result;
    }

    public State:string = "Closed";
    public toggleState(){
        switch (this.State){
            case "Closed":
                this.State = "Open";
                break;
            case "Open":
                this.State = "Closed";
                break;
            default:
                this.State = "Closed";
                break;
        }
    }
    

    public get ChangeStatus():string{
        if (this.parent.model.__controller.Status.Change.Properties[this.property.Name] === undefined)
            return "Unchanged";
        return this.parent.model.__controller.Status.Change.Properties[this.property.Name].toString();
    }

    public Select(model:Model){
         this.parent.parent.Select(model);
    }

    public Undo(){
        this.parent.model.Undo(this.property);
    }    

    public Add(){
        var repo = this.parent.model.__context.GetRepository(this.property.PropertyType);
        this.parent.parent.Select(repo);
    }
    public editModel(){
    }
    public changeModel(){

    }
    

    public Log(item:any){
        console.log(item);
    }


}