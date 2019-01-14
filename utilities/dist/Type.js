export class Type {
    constructor() {
        this.Properties = [];
        this.Name = "";
        this.Namespace = "";
        this.FullName = "";
    }
    get UID() {
        return this.FullName;
    }
    GetProperty(name) {
        return this.Properties.find(x => { return x.Name === name; });
    }
    static Create(value) {
        let uid = "";
        switch (typeof (value)) {
            case "string":
                uid = value;
                break;
            case "function":
                var prototype = value.prototype;
                if (prototype !== undefined)
                    uid = prototype.typeUID;
                break;
            default:
                throw new Error(`@lmstudios/types:Type.Create():Invalid parameter type`);
        }
        if (uid === undefined)
            throw new Error(`@lmstudios/types:Type.Create():Invalid parameter value`);
        var result = Type.Parse(uid);
        var types = Type.getTypes();
        var exists = types.find(x => { return x.UID === result.UID; });
        if (exists === undefined)
            types.push(result);
        else
            result = exists;
        if (typeof (value) === "function") {
            if (result.Constructor === undefined)
                result.Constructor = value;
        }
        types.push(result);
        return result;
    }
    static Parse(uid) {
        var match = uid.match(/^([^<]+)([\w|\W]*)/);
        if (!match)
            throw new Error(`@lmstudios/types:Type.Parse():Invalid UID(${uid})`);
        var fullName = match[1].trim();
        var genericTypes = [];
        match = match[2].trim().match(/^\s*<(.+)>\s*$/);
        if (match) {
            var genericUIDs = [];
            var genericUID = "";
            var openTags = 0;
            for (var i = 0; i < match[1].length; i++) {
                switch (match[1][i]) {
                    case '<':
                        openTags++;
                        genericUID += match[1][i];
                        break;
                    case '>':
                        openTags--;
                        genericUID += match[1][i];
                    case ',':
                        if (openTags === 0) {
                            genericUIDs.push(genericUID);
                            genericUID = "";
                        }
                        else {
                            genericUID += match[1][i];
                        }
                        break;
                    default:
                        genericUID += match[1][i];
                        break;
                }
            }
            genericUIDs.push(genericUID);
            for (var i = 0; i < genericUIDs.length; i++) {
                genericTypes.push(Type.Create(genericUIDs[i]));
            }
        }
        var names = fullName.split('.');
        var name = names[names.length - 1];
        var namespace = "";
        for (var i = 0; i < names.length - 1; i++) {
            namespace += `${names[i]}.`;
        }
        ;
        namespace = namespace.replace(/\.$/, "");
        var result = new Type();
        result.Name = name;
        result.Namespace = namespace;
        result.FullName = name;
        if (namespace.length > 0)
            result.FullName = `${namespace}.${name}`;
        result.GenericTypes = genericTypes;
        return result;
        var result = new Type();
    }
    static GetType(value) {
        return Type.getTypes().find(x => { return x.UID === value; });
    }
    static getTypes() {
        if (window.lmstudios == undefined)
            window.lmstudios = {};
        if (window.lmstudios.Types === undefined)
            window.lmstudios.Types = [];
        return window.lmstudios.Types;
    }
}
//# sourceMappingURL=Type.js.map