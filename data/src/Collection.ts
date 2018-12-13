import { Context, Model, Request, Response, Schema } from "./";
import { ServerStatus } from "./Controller";
import { Repository, ServerRepository } from "./Repository";

export class Collection<TModel extends Model> {
    constructor(model:Model, type:(new (...args:any[])=>TModel)){
        this.__model = model;
        this.__repository = <Repository<TModel>>this.__model.__context.GetRepository(type);
    }
    public __model:Model;
    public __repository:Repository<TModel>;
    public __property?:Schema.Property;
    public __status?:ServerStatus;
    public get __filter():any{
        var result = {};
        if (this.__property !== undefined){
            if (this.__property.Relationship !== undefined){
                for (var propertyName in this.__property.Relationship){
                    var parentProperty = this.__model.GetType().GetProperty(propertyName);
                    var childProperty = this.__property.Relationship[propertyName];
                    if (parentProperty !== undefined && childProperty !== undefined){
                        childProperty.SetValue(result, parentProperty.GetValue(this.__model.__controller.__values.Actual.Model));
                    }
                }
            }
        }
        return result;
    }

	public *[Symbol.iterator]() {  
        if (this.__status===undefined)
            this.Intialize();

        var items = this.__repository.Local.Search(this.__filter);
        for (const item of items) {
            yield item;
        }
    }  
    public get length():number{
        if (this.__status === undefined)
             this.Intialize();

         return this.__repository.Local.Search(this.__filter).length;
        return 0;
    }
    public Intialize(){
        switch (this.__status){
            case ServerStatus.Served:
                break;
            case ServerStatus.Serving:
                break;
            default:   
                this.__status = ServerStatus.Serving;             
                this.__repository.Search(this.__filter).then(items =>{
                    this.__status = ServerStatus.Served;
                });
                break;
        }
    }
    
}