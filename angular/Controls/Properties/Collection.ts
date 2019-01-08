import { Component, OnInit, Input, Output, EventEmitter, SchemaMetadata } from "@angular/core";
import * as LMS from "@lmstudios/data";
import { ModelControl, ModelTree, ModelNode, PropertyControl } from "../";
import { markParentViewsForCheckProjectedViews } from "@angular/core/src/view/util";

@Component({
    selector:"collection-property-control",
    templateUrl:"Collection.html",
    styleUrls:["Collection.css"]
})
export class CollectionPropertyControl extends PropertyControl {
    constructor(){
        super();
        this.ToggleState = 'Closed';
    }
    public get Table():{Properties:LMS.Data.Schema.Property[], Models:LMS.Data.Model[] }{
        var properties:LMS.Data.Schema.Property[] = [];
        var keyProperties = this.Collection.Child.Schema.PrimaryKey.Properties;
        for (var keyProperty of keyProperties){
            if (! properties.find(x => {return x === keyProperty}))
                properties.push(keyProperty);
        }
        var dataProperties = this.Collection.Child.Schema.Properties.filter(x => { return x.Relationship === undefined && x.References === undefined});
        for (var dataProperty of dataProperties){
            if (! properties.find(x => { return x === dataProperty}))
                properties.push(dataProperty);
        }
        var referenceProperties = this.Collection.Child.Schema.Properties.filter(x => { return x.Relationship === undefined && x.References !== undefined});
        for (var referenceProperty of referenceProperties){
            if (! properties.find(x => { return x === referenceProperty}))
                properties.push(referenceProperty);
        }
        // var navProperties = this.Collection.Child.Schema.Properties.filter(x => { return x.References === undefined && x.Relationship !== undefined});
        // for (var navProperty of navProperties){
        //     if (! properties.find(x => { return x === navProperty}))
        //         properties.push(navProperty);
        // }
        var result = { Properties:properties, Models:this.Collection.Items }
        return result;
    }
    public get Collection():LMS.Data.Collection<LMS.Data.Model>{
        return <LMS.Data.Collection<LMS.Data.Model>>this.Property.GetValue(this.ModelControl.Model);
    }
    public Select(model:LMS.Data.Model){
    }

    public Undo(){
    }    

    public Add(){
        this.ActiveNode.Add(this.Property);         
    }


}