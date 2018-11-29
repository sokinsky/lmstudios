import { Type } from "./Type";
import { Property } from "./Property";

export class Context {
    constructor(init?:any){
        if (init !== undefined){
            if (init.Name !== undefined) this.FullName = init.Name;
            if (init.Types !== undefined){
                init.Types.forEach((typeData:any)=>{
                    var type = new Type(this, typeData);                    
                    if (typeData.Properties !== undefined){
                        typeData.Properties.forEach((propertyData:any)=>{
                            type.Properties.push(new Property(type, propertyData));
                        });
                        
                    }
                    this.Types.push(type);
                });       
            }
        }
    }
    public get Name():string{
        var split = this.FullName.split('.');
        return split[split.length-1];
    };
    public get Namespace():string{
        var split = this.FullName.split('.');
        split = split.splice(split.length-1);
        var result = "";
        split.forEach(part =>{
            result += `${part}.`
        });
        return result.replace(/\.$/, "");
     };
    public FullName:string = "";

    public Types:Type[] = [];

    public GetType(name:string|(new (...args: any[]) => any)):Type {
        var result = this.Types.find(type => {
            return (type.FullName == name)
        }); 
        if (result == null)
            result = new Type(this, name);
        return result;

    }
}