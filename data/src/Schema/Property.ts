import { Type } from "../Type";
import { Context, Model } from "./";

export class Property {
    constructor(model:Model, name:string){
        this.Model = model; 
        this.Name = name;
        this.PropertyType = new Type("any");
    }
    public Initialize(data:any) { 
        if (data.Name === undefined)
            throw new Error(`Property.Initialize():Name is required`);
        if (data.Name !== this.Name)
            throw new Error(`Property.Initialize():Name does not match`);
        this.Name = data.Name;

        if (data.PropertyType === undefined)
            throw new Error(`Property.Initialize():PropertyType is required`);
        this.PropertyType = Type.GetType(data.PropertyType);
        if (data.Optional !== undefined){
            if (this.Optional === undefined)
                this.Optional = [];
            for (var optionalData of data.Optional){
                var model = this.Model.Context.GetModel(optionalData.Model);
                if (model === undefined)
                    throw new Error(`Property.Initialize():Option.Model(${optionalData.Model}) does not exist!`);

                var property = model.GetProperty(optionalData.Name);
                if (property === undefined)
                    throw new Error(`Property.Initialize():Option.Name(${optionalData.Name}) does not exist on Model(${model.FullName})`);
                
                if (! this.Optional.find(x => x === property))
                    this.Optional.push(property);
            }            
        }
        if (data.Principal !== undefined){
            var model = this.Model.Context.GetModel(data.Principal.Model);
            if (model === undefined)
                throw new Error(`Property.Initialize():Principal.Model(${data.Principal.Model}) does not exist!`);

            var property = model.GetProperty(data.Principal.Name);
            if (property === undefined)
                throw new Error(`Property.Initialize():Principal.Name(${data.Principal.Name}) does not exist on Model(${model.FullName})`);
            
            if (this.Principal !== undefined)
                this.Principal = property;
        }
        if (data.Relationship !== undefined){
            if (this.Relationship === undefined)
                this.Relationship = {};

            for (var key in data.Relationship){
                var propertyData = data.Relationship[key];
                var model = this.Model.Context.GetModel(propertyData.Model);
                 if (model === undefined)
                    throw new Error(`Property.Initialize():Relationship.Model(${propertyData.Model}) does not exist!`);

                var property = model.GetProperty(propertyData.Name);
                if (property === undefined)
                    throw new Error(`Property.Initialize():Relationship.Name(${propertyData.Name}) does not exist on Model(${model.FullName})`);
                
                this.Relationship[key] = property;
            }
        }       
        if (data.References !== undefined){
            if (this.References === undefined)
                this.References = [];
            
            for (var referenceData of data.References){
                var model = this.Model.Context.GetModel(referenceData.Model);
                if (model === undefined)
                    throw new Error(`Property.Initialize():Relationship.Model(${referenceData.Model}) does not exist!`);

                var property = model.GetProperty(referenceData.Name);
                if (property === undefined)
                    throw new Error(`Property.Initialize():Relationship.Name(${referenceData.Name}) does not exist on Model(${model.FullName})`);
                
                if (! this.References.find(x => { return x === property }))
                    this.References.push(property);
            }

        }
    }
    public Model:Model;
    public Name:string;
    public PropertyType:Type;

    public Principal?:Property;
    public Optional?:Property[];
    public Relationship?:{[name:string]:Property};
    public References?:Property[];
    
    public GetValue(item:any):any{
        if (item === undefined)
            return undefined;
        return item[this.Name];
    }
    public SetValue(item:any, value:any){
        if (item === undefined)
            return;
        item[this.Name] = value;
    }
}