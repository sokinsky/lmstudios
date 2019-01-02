import { Component, OnInit, Input, Output, EventEmitter, SchemaMetadata } from "@angular/core";
import { Repository, Collection, Model, Schema } from "@lmstudios/data";
import { ModelControl, PropertyControl } from "../";
import { ThrowStmt } from "@angular/compiler";

@Component({
    selector:"collection-property-control",
    templateUrl:"Collection.html",
    styleUrls:["Collection.css"]
})
export class CollectionPropertyControl extends PropertyControl {
    public async ngOnInit(){
    }
    public get Table():{Properties:Schema.Property[], Models:Model[] }{
        var result = { Properties:this.Collection.Child.Schema.Properties, Models:this.Collection.Items }
        return result;
    }
    public get Collection():Collection<Model>{
        return <Collection<Model>>this.Property.GetValue(this.ModelControl.Model);
    }

    // public __table:{
    //     Columns:{Name:string, Type:string }[],
    //     Rows:Model[]
    // } = { Columns:[], Rows:[] }
    // public get Table():{Columns:Schema.Property[], Rows:Model[] }{
    //     var result:{Columns:Schema.Property[], Rows:Model[]} = {Columns:[], Rows:[]};
    //     var collection:Collection<Model> = <Collection<Model>>this.property.GetValue(this.parent.Model);        
    //     var properties:Schema.Property[] = [];
    //     properties.push(collection.Child.Schema.PrimaryKeyProperty);
    //     for (var property of collection.Child.Schema.Properties){ 
    //         if (property.References === undefined){
    //             if (! properties.find(x => x === property))
    //                 properties.push(property);
    //         }
    //     }
    //     result.Columns = properties.sort((x,y)=>{
    //         if (x.Relationship === undefined && y.Relationship !== undefined) return -1;
    //         if (x.Relationship !== undefined && y.Relationship === undefined) return 1;
    //         return 0;
    //     });
    //     result.Rows = collection.Items;
        
    //     return result;
    // }


    public Select(model:Model){
    }

    public Undo(){
    }    

    public Add(){
        if (this.ModelControl.ContextControl.Tree !== undefined){
            this.ModelControl.ContextControl.Tree.Current.Property = this.Property;
        }
            
    }


}