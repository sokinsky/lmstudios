import { Type } from "@lmstudios/types";
import { Key } from "./Key";
import { Model } from "./Model";
import { Property } from "./Property";
export class Context {
    constructor(contextData) {
        this.Models = [];
        if (contextData !== undefined) {
            if (contextData.Models !== undefined) {
                for (var modelData of contextData.Models) {
                    var type = Type.GetType(modelData.FullName);
                    if (type === undefined)
                        throw new Error(`Unable to find model of type '${modelData.FullName}'`);
                    var model = this.Models.find(x => { return x.Type === type; });
                    if (model === undefined) {
                        model = new Model(this, type);
                        this.Models.push(model);
                    }
                    if (modelData.Properties !== undefined) {
                        for (var propertyData of modelData.Properties) {
                            model.Properties.push(new Property(model, propertyData.Name));
                        }
                    }
                    this.Models.push(model);
                }
            }
            for (let model of this.Models) {
                var modelData = contextData.Models.find((x) => { return x.FullName === model.Type.FullName; });
                for (let property of model.Properties) {
                    let propertyData = modelData.Properties.find((x) => { return (x.Name === property.Name); });
                    if (propertyData !== undefined)
                        property.Initialize(propertyData);
                }
                for (let keyData of modelData.Keys) {
                    let key = model.Keys.find((x) => { return x.Name == keyData.Name; });
                    if (key === undefined) {
                        key = new Key(model, keyData);
                        model.Keys.push(key);
                    }
                }
            }
        }
    }
}
//# sourceMappingURL=Context.js.map