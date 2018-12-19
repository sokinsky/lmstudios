console.log("LMS.Data.Type");


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
    public static GetType(type:string|(new (...args: any[]) => any)|object):Type{
        switch (typeof(type)){
            case "string":
                return Type.getType_byName(<string>type);
            case "function":
                return Type.getType_byConstructor(<new (...args: any[])=>any>type);
            case "object":
                return Type.getType_byObject(<object>type);
            default:
                console.log(type);
                throw new Error(`Type.GetType():Invalid Parameter`);
        }
        
    }
    private static getType_byName(name:string):Type{
        var results = Type.GetTypes().filter((type:Type)=>{ return type.FullName === name});
        switch (results.length){
            case 0:
                return Type.Parse(name);
            case 1:
                return results[0];
            default:
                throw new Error(`Type.getType_byName():Type(${name}) was ambiguous.`);
        }
    }
    private static getType_byConstructor(constructor:(new (...args: any[]) => any)):Type{
        var results = Type.GetTypes().filter((type:Type)=>{return type.Constructor === constructor;});
        switch (results.length){
            case 0:
                throw new Error(`Type.getType_byConstructor():Unknown constructor`);
            case 1:
                return results[0];
            default:
                throw new Error(`Type.getType_byConstructor():Anbiguous constructor`);
        }
    }
    private static getType_byObject(obj:object):Type{
        return this.getType_byConstructor((<any>obj).prototype.constrcutor);
    }
    public static Parse(name:string) : Type{        
        var result:Type|undefined;
        name = name.replace(/\s+/, "");          
        var match = name.match(/^\s*([^<]+)<([^>]*)>/);
        if (match !== null && match.length == 3){
            var rootName = match[1];          
            var genericNames = match[2].split(',');
            var genericTypes:Type[] = [];
            for (var genericName of genericNames){
                var genericType = Type.Parse(genericName);
                genericTypes.push(genericType);
            }
            result = Type.Parse(rootName);
            result.GenericTypes = genericTypes;           
        }
        else{
            result = new Type(name);
        }
        if (result !== undefined){
            var storedType:Type|undefined = Type.GetTypes().find((type:Type)=>{ return type.FullName === (<Type>result).FullName});
            if (storedType === undefined){
                Type.GetTypes().push(result);
            }                
            else 
                result = storedType;

            if (result.GenericTypes !== undefined){
                for (var i=0; i<result.GenericTypes.length; i++){
                    var genericType = result.GenericTypes[i];
                    storedType = Type.GetTypes().find((type:Type)=>{ return type.FullName === genericType.FullName});
                    if (storedType === undefined)
                        Type.GetTypes().push(genericType);
                    else 
                        result.GenericTypes[i] = storedType;
                }
            }
            return result;
        }
        throw new Error(`Type.Parse():Unable to parse Type(${name})`);
    }
 }
