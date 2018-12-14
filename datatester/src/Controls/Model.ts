import { Component, OnInit, Input } from "@angular/core";
import { Model as Data, Collection, Schema } from "@lmstudios/data";
import { overrideProvider } from "@angular/core/src/view";

@Component({
    selector:"model-control",
    templateUrl:"Model.html",
    styleUrls:["Model.css"]
})
export class Model implements OnInit {
	constructor() { }
    public async ngOnInit(){
    }

    private __model:Data|undefined;
    public get model():Data|undefined{
        return this.__model;
    }
    @Input()public set model(value:Data|undefined){
        if (this.__model !== value){
            this.__model = value;
        }
    }
    public get dataProperties():Schema.Property[]{
        if (this.model === undefined)
            return [];
        return this.model.GetSchema().Properties.filter(x => { return (! (x.PropertyType instanceof Schema.Model) &&  x.PropertyType.Name !== "Collection" )});
    }
    public get modelProperties():Schema.Property[]{
        if (this.model === undefined)
            return []
        return this.model.GetSchema().Properties.filter(x => { return x instanceof Schema.Model; })
    }
    public get collectionProperies():Schema.Property[]{
        if (this.model === undefined)
            return []
        return this.model.GetSchema().Properties.filter(x => { return x.PropertyType.Name === "Collection"; })
    }

    public getPre(item:Schema.Property|Data|Collection<Data>|undefined):string|undefined{

        if (this.model === undefined || item === undefined)
            return undefined;
        if (item instanceof Schema.Property){
            var getItem = this.model.GetValue(item);
            //console.log(getItem);
        }

        if (item instanceof Data)
            return JSON.stringify(item.__controller.__values.Actual.Data, null, "\t");
        else if (item instanceof Collection)
            return "not implemented";
    }


    public Add(property:Schema.Property){
        if (this.model !== undefined && property.Model !== undefined) {
            let parentModel:Data = this.model;

            var newModel = parentModel.__context.GetRepository(property.Model).Add({});
            this.model = newModel;

            if (property.Relationship !== undefined){
                let relationship:{[name:string]:Schema.Property} = property.Relationship;
                for (var propertyName in relationship){
                    let foreignProperty = property.Relationship[propertyName];
                    if (foreignProperty.References !== undefined){
                        let references:Schema.Property[] = foreignProperty.References;
                        if (this.model !== undefined){
                            let reference = references.find(x => x.Model === parentModel.GetType());
                            if (reference !== undefined){
                                newModel.SetValue(reference, parentModel);
                            }
                        }                        
                    }
                }
            }

        }
    }
    

    

    public GetValue(property:Schema.Property){
        return property.GetValue(this.model);
    }
    public Log(item:any){
        console.log(item);
    }
}