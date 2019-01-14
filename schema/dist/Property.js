import { Type } from "@lmstudios/types";
export class Property {
    constructor(model, name) {
        this.Required = false;
        this.Model = model;
        this.Name = name;
        var propertyType = Type.GetType("any");
        if (propertyType === undefined)
            propertyType = Type.Create("any");
        this.PropertyType = propertyType;
    }
    Initialize(data) {
        var propertyType = Type.GetType(data.PropertyType);
        if (propertyType === undefined)
            propertyType = Type.Create(data.PropertyType);
        if (data.Optional !== undefined) {
            if (this.Optional === undefined)
                this.Optional = [];
            for (var optionalData of data.Optional) {
                var model = this.Model.Context.Models.find((x) => { return x.Type.UID === optionalData.Model; });
                if (model === undefined)
                    throw new Error(`Property.Initialize():Option.Model(${optionalData.Model}) does not exist!`);
                var property = model.Properties.find((x) => { return x.Name === optionalData.Name; });
                if (property === undefined)
                    throw new Error(`Property.Initialize():Option.Name(${optionalData.Name}) does not exist on Model(${model.Type.FullName})`);
                if (!this.Optional.find(x => x === property))
                    this.Optional.push(property);
            }
        }
        if (data.Principal !== undefined) {
            var model = this.Model.Context.Models.find((x) => { return x.Type.UID === optionalData.Model; });
            if (model === undefined)
                throw new Error(`Property.Initialize():Principal.Model(${optionalData.Model}) does not exist!`);
            var property = model.Properties.find((x) => { return x.Name === optionalData.Name; });
            if (property === undefined)
                throw new Error(`Property.Initialize():Principal.Name(${optionalData.Name}) does not exist on Model(${model.Type.FullName})`);
            if (this.Principal !== undefined)
                this.Principal = property;
        }
        if (data.Relationship !== undefined) {
            if (this.Relationship === undefined)
                this.Relationship = {};
            for (var key in data.Relationship) {
                var propertyData = data.Relationship[key];
                var model = this.Model.Context.Models.find((x) => { return x.Type.UID === propertyData.Model; });
                if (model === undefined)
                    throw new Error(`Property.Initialize():Relationship.Model(${propertyData.Model}) does not exist!`);
                var property = model.Properties.find((x) => { return x.Name === propertyData.Name; });
                if (property === undefined)
                    throw new Error(`Property.Initialize():Relationship.Name(${propertyData.Name}) does not exist on Model(${model.Type.FullName})`);
                this.Relationship[key] = property;
            }
        }
        if (data.References !== undefined) {
            if (this.References === undefined)
                this.References = [];
            for (var referenceData of data.References) {
                var model = this.Model.Context.Models.find((x) => { return x.Type.UID === referenceData.Model; });
                if (model === undefined)
                    throw new Error(`Property.Initialize():Relationship.Model(${referenceData.Model}) does not exist!`);
                var property = model.Properties.find((x) => { return x.Name === referenceData.Name; });
                if (property === undefined)
                    throw new Error(`Property.Initialize():Relationship.Name(${referenceData.Name}) does not exist on Model(${model.Type.FullName})`);
                if (!this.References.find(x => { return x === property; }))
                    this.References.push(property);
            }
        }
    }
    GetValue(item) {
        return item[this.Name];
    }
    SetValue(item, value) {
        item[this.Name] = value;
    }
}
//# sourceMappingURL=Property.js.map