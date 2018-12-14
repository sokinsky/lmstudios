export class Type {
    constructor(name:string, constructor?:(new (...args: any[]) => any)){
        this.FullName = name;
        this.Name = "";
        this.Namespace = "";
        var split = name.split('.');
        for (var i=0; i<split.length; i++){
            if (i === split.length-1)
                this.Name = split[i];
            else
                this.Namespace += `${split[i]}.`
        }
        this.Namespace = this.Namespace.replace(/\.$/, "");
        
        this.Constructor = constructor;
    } 
    public Name:string;
    public Namespace:string;
    public FullName:string;

    public BaseType?:Type;
    public GenericTypes?:Type[];

    public Constructor?:(new (...args: any[]) => any);

    public static GetTypes():Type[]{
        if ((<any>window).lmstudios == undefined)
            (<any>window).lmstudios = {}     
        if ((<any>window).lmstudios.Types === undefined)
            (<any>window).lmstudios.Types = [];
        return (<any>window).lmstudios.Types;
    }
    public static GetType(type:string|(new (...args: any[]) => any)|object):Type|undefined{
        switch (typeof(type)){
            case "string":
                return Type.getType_byName(<string>type);
            case "function":
                return Type.getType_byConstructor(<new (...args: any[])=>any>type);
            case "object":
                return Type.getType_byObject(<object>type);
        }
        return undefined;
    }
    private static getType_byName(name:string):Type|undefined{
        return Type.GetTypes().find((type:Type)=>{ return type.FullName === name});
    }
    private static getType_byConstructor(constructor:(new (...args: any[]) => any)):Type|undefined{
        return Type.GetTypes().find((type:Type)=>{ return type.Constructor === constructor});
    }
    private static getType_byObject(object:object):Type|undefined{
        throw new Error(`Not Implemented`);
    }
    public static Parse(name:string){
        name = name.replace(/\s+/, "");          
        var match = name.match(/^\s*([^<]+)<([^>]*)>/);
        if (match !== null && match.length == 3){
            var rootName = match[1];
            var genericNames = match[2];
            var genericTypes:Type[] = [];
            for (var genericName in genericNames.split(',')){
                var genericType = Type.GetType(genericName);
                if (genericType === undefined)
                    genericType = Type.Create(genericName);
                genericTypes.push(genericType);
            }
            var rootType = this.GetType(rootName);
            if (rootType === undefined)
                rootType = Type.Create(rootName);
            rootType.GenericTypes = genericTypes;
            return rootType;                
        }
        else{
            var rootType = this.GetType(name);
            if (rootType === undefined)
                rootType = Type.Create(name);
            return rootType;
        }
    }
    public static Create(name:string, constructor?:(new (...args: any[]) => any)){
        var result = Type.GetType(name);
        if (result === undefined){
            result = new Type(name, constructor);
            Type.GetTypes().push(result);
        }
        return result;
    }
 }
