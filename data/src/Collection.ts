import { Type, Property } from "@lmstudios/types";
import * as Schema from "@lmstudios/schema";

import { Context } from "./Context";
import { Model } from "./Model";
import { Repository } from "./Repository";

export class Collection<TModel extends Model> {
    // constructor(parentModel:Model, type:(new (...args:any[])=>TModel)){
    //     this.Parent = {
    //         Model: parentModel                        
    //     };
    //     this.Child = {
    //         Schema:this.Context.Schema.GetModel(type),
    //         Repository: <Repository<TModel>>parentModel.__context.GetRepository(type)
    //     }
    // }
    // public Parent:{
    //     Model:Model,
    //     Property?:Schema.Property,
    // }
    // public Child:{
    //     Schema:Schema.Model,
    //     Repository:Repository<TModel>
    // }
    // public Status?:ServerStatus;
    // public get Context():Context{
    //     return this.Parent.Model.__context;
    // }

    // private generateDefaultFilter() : Partial<TModel>{
    //     var result:Partial<TModel> = {};
    //     if (this.Parent.Property === undefined)
    //         throw new Error(``);

    //     for (var parentPropertyName in this.Parent.Property.Relationship){
    //         var parentProperty = this.Parent.Model.GetSchema().GetProperty(parentPropertyName);
    //         if (parentProperty === undefined)
    //             throw new Error(`Collection,.generateDefaultFilter():Parent(${this.Parent.Model.GetSchema().FullName}) does not have property(${propertyName})`);
    //         var childProperty = this.Parent.Property.Relationship[propertyName];
    //         if (childProperty.Model !== this.Child.Schema)
    //             throw new Error(`Collection.generateDefaultFilter():Relationship does not belog to child(${this.Child.Schema.FullName})`);
    //         childProperty.SetValue(result, parentProperty.GetValue(this.Parent.Model));
    //     }    
    //     return result;
        
    // }

    // public get Items():TModel[]{
    //     if (this.Status === undefined)
    //         this.Intialize();
    //     return this.Child.Repository.Local.Search(this.generateDefaultFilter());
    // }

    // public Add(){
    //     var added = this.Child.Repository.Add();
    //     var properties = this.Child.Schema.Properties.filter(x => {return x.PropertyType === this.Parent.Model.GetSchema()})
    //     for (var property of properties){
    //         property.SetValue(added, this.Parent.Model);
    //     }
    //     return added;
    // }

	// public *[Symbol.iterator]() {  
    //     if (this.Status===undefined)
    //         this.Intialize();
    //     for (const item of this.Items) {
    //         yield item;
    //     }
    // }  
    // public get length():number{
    //     if (this.Status === undefined)
    //          this.Intialize();

    //     var items = this.Child.Repository.Local.Search(this.generateDefaultFilter());
    //     return items.length;
    // }
    // public Intialize(){
    //     switch (this.Status){
    //         case ServerStatus.Served:
    //             break;
    //         case ServerStatus.Serving:
    //             break;
    //         default:                        
    //             var filter = this.generateDefaultFilter();
    //             var server = true;
    //             for (var key in filter){
    //                 var property = this.Child.Schema.GetProperty(key);
    //                 if (property !== undefined){
    //                     if (typeof(filter[key]) !== property.PropertyType.Name)
    //                         server = false;
    //                 }
    //             }      
    //             if (server){
    //                 this.Status = LMS.ServerStatus.Serving;
    //                 this.Child.Repository.Search(filter).then(items =>{
    //                     this.Status = LMS.ServerStatus.Served;
    //                 });
    //             }  
    //             break;
    //     }
    // }
    
}