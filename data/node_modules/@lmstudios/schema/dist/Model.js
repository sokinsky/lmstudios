export class Model {
    constructor(context, type) {
        this.Properties = [];
        this.Keys = [];
        this.Context = context;
        this.Type = type;
    }
    GetProperty(name) {
        return this.Properties.find(x => {
            return x.Name == name;
        });
    }
    get PrimaryKey() {
        if (this.Keys.length == 0)
            throw new Error(`Type(${this.Type.FullName}) does not have a PrimaryKey`);
        var key = this.Keys[0];
        if (key.Properties.length != 1)
            throw new Error(`Type(${this.Type.FullName}) does not have a PrimaryKey`);
        return key;
    }
    get PrimaryKeyProperty() {
        return this.PrimaryKey.Properties[0];
    }
    get AdditionalKeys() {
        var result = [];
        this.Keys.forEach(key => {
            if (key !== this.PrimaryKey)
                result.push(key);
        });
        return result;
    }
}
//# sourceMappingURL=Model.js.map