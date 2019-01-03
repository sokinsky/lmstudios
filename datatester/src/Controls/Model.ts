import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { Model, Collection, Repository, Schema, ChangeStatus, ResponseStatus } from "@lmstudios/data";
import { ContextControl } from "./";

@Component({
    selector:"model-control",
    templateUrl:"Model.html",
    styleUrls:["Model.css"]
})
export class ModelControl implements OnInit {
	constructor() { }
    public async ngOnInit(){
    }
    private __contextControl?:ContextControl;
    public get ContextControl():ContextControl{
        if (this.__contextControl === undefined)
            throw new Error(``);
        return this.__contextControl;
    }
    @Input() public set ContextControl(value:ContextControl){
        this.__contextControl = value;
    }
    public get Visible():boolean{
        if (this.ContextControl.SelectedModel !== undefined){
            return this.ActiveNode.Property === undefined;
        }
        return false;
    }
    public get ActiveNode():ModelNode{        
        if (this.ContextControl.SelectedModel !== undefined)
            return this.ContextControl.SelectedModel.ActiveNode; 
        throw new Error(``);
    }
    public get Model():Model{
        return this.ActiveNode.Model;
    }
    public get Label():string{
        if (this.ContextControl.SelectedModel !== undefined)
            return this.ContextControl.SelectedModel.Label;
        throw new Error(``);
    }
    public async OK(){
        switch (this.ChangeState){
            case "Added":
                var repository = this.ActiveNode.Model.__controller.Context.GetRepository(this.ActiveNode.Model.GetSchema());
                var duplicate = await this.ActiveNode.Model.Duplicate()
                if (duplicate !== undefined){
                     if (this.ActiveNode.ParentNode !== undefined){
                        if (this.ActiveNode.ParentNode.Property !== undefined)
                            this.ActiveNode.ParentNode.Property.SetValue(this.ActiveNode.ParentNode.Model, duplicate);
                        this.ActiveNode.Model.Remove();
 
                    }
                }
                if (this.ActiveNode.ParentNode !== undefined){
                    this.ActiveNode.ParentNode.Property = undefined;
                    this.ActiveNode.ParentNode.ChildNode = undefined; 
                }
                else{
                    this.ContextControl.SelectedModel = undefined;
                }                 
                break;
            case "Unchanged":
            case "Modified":
                if (this.ActiveNode.ParentNode !== undefined){
                    this.ActiveNode.ParentNode.Property = undefined;
                    this.ActiveNode.ParentNode.ChildNode = undefined; 
                }
                else{
                    this.ContextControl.SelectedModel = undefined;
                }  
                break;    
        }
    }
    public Cancel(){
        switch (this.ChangeState){
            case "Added":
                if (this.ActiveNode.ParentNode === undefined)
                    this.ActiveNode.Model.Remove();
                else if (this.ActiveNode.ParentNode.Property !== undefined)
                    this.ActiveNode.Model.Remove(this.ActiveNode.ParentNode.Property);
                break;
            case "Modified":
                this.ActiveNode.Model.Undo();
                break;
        }
        if (this.ActiveNode.ParentNode !== undefined)
            this.ActiveNode.ParentNode.ChildNode = undefined;
        else
            this.ContextControl.SelectedModel = undefined;
    }

    public get ChangeState():string {
        var result = this.Model.__controller.Status.Change.Model;
        if (result !== undefined)
            return result.toString();
        throw new Error(``);
    }



    public get Properties():Schema.Property[]{
        var properties:Schema.Property[] = [];
        var keyProperties = this.Model.GetSchema().PrimaryKey.Properties;
        for (var keyProperty of keyProperties){
            if (! properties.find(x => {return x === keyProperty}))
                properties.push(keyProperty);
        }
        var dataProperties = this.Model.GetSchema().Properties.filter(x => { return x.Relationship === undefined && x.References === undefined});
        for (var dataProperty of dataProperties){
            if (! properties.find(x => { return x === dataProperty}))
                properties.push(dataProperty);
        }
        var referenceProperties = this.Model.GetSchema().Properties.filter(x => { return x.Relationship === undefined && x.References !== undefined});
        for (var referenceProperty of referenceProperties){
            if (! properties.find(x => { return x === referenceProperty}))
                properties.push(referenceProperty);
        }
        var modelProperties = this.Model.GetSchema().Properties.filter(x => { return x.PropertyType instanceof Schema.Model});
        for (var navProperty of modelProperties){
            if (! properties.find(x => { return x === navProperty}))
                properties.push(navProperty);
        }
        var collectionProperties = this.Model.GetSchema().Properties.filter(x => { return x.PropertyType.Name === "Collection" });
        for (var collectionProperty of collectionProperties){
            if (! properties.find(x => { return x === collectionProperty}))
                properties.push(collectionProperty);
        }
        return properties
    }

    
    public Log(item:any){
        console.log(item);
    }
    public Json(item:any):string{
        if (item instanceof Model)
            return JSON.stringify(item.__controller.Values.Actual.Data, null, "\t");
        return JSON.stringify(item, null, "\t");
    }

}
export class ModelTree{
    constructor(model:Model){
        this.RootNode = new ModelNode(this, model);
    }
    public RootNode:ModelNode;
    public get ActiveNode():ModelNode{
        var result = this.RootNode;
        while (result.ChildNode !== undefined)
            result = result.ChildNode;
        return result;
    }

    public get Label():string{
        return this.generateLabel(this.RootNode);
    }
    public generateLabel(node:ModelNode, result?:string):string{
        if (result === undefined)
            result = "";

        if (result === "")
            result = `${node.Model.toString()}.`;
        else {
            if (node.ParentNode !== undefined && node.ParentNode.Property !== undefined)
                result += `${node.ParentNode.Property.Name}.`
        }
        if (node.ChildNode === undefined)
            return result.replace(/\.$/, "");
        else 
            return this.generateLabel(node.ChildNode, result);
    }


}
export class ModelNode{
    constructor(tree:ModelTree|ModelNode, model:Model, property?:Schema.Property){
        if (tree instanceof ModelTree)
            this.Tree = tree;
        else {
            this.ParentNode = tree;
            this.Tree = tree.Tree;
        }
        this.Model = model;
        this.Property = property
    }
    public Tree:ModelTree;

    public Model:Model;
    public Property?:Schema.Property;    
    public ParentNode?:ModelNode;
    private __childNode?:ModelNode    
    public get ChildNode():ModelNode|undefined{
        return this.__childNode;
    }
    public set ChildNode(value:ModelNode|undefined){
        this.__childNode = value;
        if (value !== undefined)
            value.ParentNode = this;
    }
    public get RootNode():ModelNode{
        return this.Tree.RootNode;
    }
    public get Label():string{
        return this.Tree.Label;
    }

    public Select(property:Schema.Property){

    }
    public Add(property:Schema.Property){
        var added:Model;
        if (property.PropertyType.Name === "Collection"){
            var collection = property.GetValue(this.Model);
            if (collection instanceof Collection){
                added = collection.Add();
                this.Property = property;
                this.ChildNode = new ModelNode(this, added);
            }                       
        }
        else if (property.PropertyType instanceof Schema.Model){
            var context = this.Model.__controller.Context;
            var repository = context.GetRepository(property.PropertyType);
            added = repository.Add();
            property.SetValue(this.Model, added);
            this.Property = property;
            this.ChildNode = new ModelNode(this, added);
        }
    }
    public Remove(property:Schema.Property){

    }
    public OK(){

    }
    public Cancel(){

    }
    public Undo(){

    }


}