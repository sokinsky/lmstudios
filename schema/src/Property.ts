import { Type } from "@lmstudios/types";
import { Context } from "./Context";
import { Model } from "./Model";

export class Property {
    constructor(model:Model, name:string){
        this.Model = model; 
        this.Name = name;

        var propertyType = Type.GetType("any");
        if (propertyType === undefined)
            propertyType = Type.Create("any");
        this.PropertyType = propertyType;
    }
    public Initialize(data:any) { 
        var propertyType = Type.GetType(data.PropertyType);
        if (propertyType === undefined)
            propertyType = Type.Create(data.PropertyType);
        
        if (data.Optional !== undefined){
            if (this.Optional === undefined)
                this.Optional = [];
            for (var optionalData of data.Optional){
                var model = this.Model.Context.Models.find((x:Model) => { return x.Type.UID === optionalData.Model } );
                if (model === undefined)
                    throw new Error(`Property.Initialize():Option.Model(${optionalData.Model}) does not exist!`);

                var property = model.Properties.find((x:Property) => { return x.Name === optionalData.Name});
                if (property === undefined)
                    throw new Error(`Property.Initialize():Option.Name(${optionalData.Name}) does not exist on Model(${model.Type.FullName})`);
                
                if (! this.Optional.find(x => x === property))
                    this.Optional.push(property);
            }            
        }
        if (data.Principal !== undefined){
            var model = this.Model.Context.Models.find((x:Model) => { return x.Type.UID === optionalData.Model } );
            if (model === undefined)
                throw new Error(`Property.Initialize():Principal.Model(${optionalData.Model}) does not exist!`);

            var property = model.Properties.find((x:Property) => { return x.Name === optionalData.Name});
            if (property === undefined)
                throw new Error(`Property.Initialize():Principal.Name(${optionalData.Name}) does not exist on Model(${model.Type.FullName})`);
            

            if (this.Principal !== undefined)
                this.Principal = property;
        }
        if (data.Relationship !== undefined){
            if (this.Relationship === undefined)
                this.Relationship = {};

            for (var key in data.Relationship){
                var propertyData = data.Relationship[key];
                var model = this.Model.Context.Models.find((x:Model) => { return x.Type.UID === propertyData.Model } );
                 if (model === undefined)
                    throw new Error(`Property.Initialize():Relationship.Model(${propertyData.Model}) does not exist!`);

                var property = model.Properties.find((x:Property) => { return x.Name === propertyData.Name});
                if (property === undefined)
                    throw new Error(`Property.Initialize():Relationship.Name(${propertyData.Name}) does not exist on Model(${model.Type.FullName})`);
                
                this.Relationship[key] = property;
            }
        }       
        if (data.References !== undefined){
            if (this.References === undefined)
                this.References = [];
            
            for (var referenceData of data.References){
                var model = this.Model.Context.Models.find((x:Model) => { return x.Type.UID === referenceData.Model } );
                if (model === undefined)
                    throw new Error(`Property.Initialize():Relationship.Model(${referenceData.Model}) does not exist!`);

                    var property = model.Properties.find((x:Property) => { return x.Name === referenceData.Name});
                if (property === undefined)
                    throw new Error(`Property.Initialize():Relationship.Name(${referenceData.Name}) does not exist on Model(${model.Type.FullName})`);
                
                if (! this.References.find(x => { return x === property }))
                    this.References.push(property);
            }

        }
    }
    public Model:Model;
    public Name:string;
    public PropertyType:Type;
    public Required:boolean = false;

    public Principal?:Property;
    public Optional?:Property[];
    public Relationship?:{[name:string]:Property};
    public References?:Property[];

    public GetValue(item:any){
        return item[this.Name];
    }
    public SetValue(item:any, value:any){
        item[this.Name] = value;
    }
}