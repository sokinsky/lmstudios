import { Property } from "./Property";

export class Type {
    constructor(){
        this.Name = "";
        this.Namespace = "";
        this.FullName = "";  
    } 
    public get UID():string{
        return this.FullName;
    }
    public Name:string;
    public Namespace:string;
    public FullName:string;
    public Properties:Property[] = [];
    public GetProperty(name:string):Property|undefined{
        return this.Properties.find(x => { return x.Name === name});
    }

    public BaseType?:Type;
    public GenericTypes?:Type[];





    public Constructor?:(new (...args: any[]) => any);


    public IsSubTypeOf(value:string|Type):boolean{
        let type:Type|undefined;
        if (typeof(value)==="string"){
            type = Type.GetType(value);
            if (! (type instanceof Type))
                return false
        }
        if (this.Constructor !== undefined){
            var prototype = this.Constructor
            while (prototype){
                console.log(prototype);
                var subType = Type.GetType(prototype);              
                prototype = prototype.prototype;
            }
        }
        return false;
    }


    public static Create(value:string|(new (...args: any[]) => any)):Type{
        let uid:string = "";
        switch (typeof(value)){
            case "string":
                uid = <string>value;
                break;
            case "function":
                var prototype = (<(new (...args: any[]) => any)>value).prototype;
                if (prototype !== undefined)
                    uid = prototype.typeUID;
                break;
            default:
                throw new Error(`@lmstudios/types:Type.Create():Invalid parameter type`);
        }
        if (uid === undefined)
            throw new Error(`@lmstudios/types:Type.Create():Invalid parameter value`);
        var result = Type.Parse(uid);

        var types = Type.GetTypes();
        var exists = types.find(x => { return x.UID === result.UID; });
        if (exists === undefined)
            types.push(result);
        else
            result = exists;           
        if (typeof(value) === "function"){
            (<(new (...args: any[]) => any)>value).prototype.type = result;
            if (result.Constructor === undefined)
                result.Constructor = value;
        }
        return result;        

    }
    public static Parse(uid:string):Type{
        var match = uid.match(/^([^<]+)([\w|\W]*)/);
        if (! match)
            throw new Error(`@lmstudios/types:Type.Parse():Invalid UID(${uid})`);
        var fullName = match[1].trim();
 
        var genericTypes = [];
        match = match[2].trim().match(/^\s*<(.+)>\s*$/);
        if (match){
            var genericUIDs = [];
            var genericUID = "";
            var openTags = 0;
            for (var i=0; i<match[1].length; i++){
                switch (match[1][i]){
                    case '<': 
                        openTags ++;
                        genericUID += match[1][i];
                        break;
                    case '>': 
                        openTags --;
                        genericUID += match[1][i];
                    case ',':
                        if (openTags === 0){
                            genericUIDs.push(genericUID);
                            genericUID = "";
                        }
                        else{
                            genericUID += match[1][i];
                        }                           
                        break;
                    default:
                        genericUID += match[1][i];
                        break;
                }
            }    
            genericUIDs.push(genericUID);     
            for (var i=0; i<genericUIDs.length; i++){
                genericTypes.push(Type.Create(genericUIDs[i]))
            }
        }

        var names = fullName.split('.');
        var name = names[names.length-1];
        var namespace = "";
        for(var i=0; i<names.length-1; i++){
            namespace += `${names[i]}.`
        };
        namespace = namespace.replace(/\.$/, "");

        var result = new Type();
        result.Name = name;
        result.Namespace = namespace;
        result.FullName = name;
        if (namespace.length > 0)
            result.FullName = `${namespace}.${name}`
        result.GenericTypes = genericTypes;
        return result;


        var result = new Type();
    }
    public static GetType(value:string|(new (...args: any[]) => any)):Type|undefined{
        console.log(value);
        switch (typeof(value)){
            case "string":
                return Type.GetTypes().find(x => { return x.UID === value; });
            case "function":
                console.log(value);
                var result = Type.GetTypes().find(x => { return (<any>x).__proto__ === value })
                console.log(result);
                return result;
            default:
                console.log(typeof(value));
                break;
        }
        
    }

    public static GetTypes():Type[]{
        if ((<any>window).lmstudios == undefined)
            (<any>window).lmstudios = {}     
        if ((<any>window).lmstudios.Types === undefined)
            (<any>window).lmstudios.Types = [];
        return (<any>window).lmstudios.Types;
    }
 }
