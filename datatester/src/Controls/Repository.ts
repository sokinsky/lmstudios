import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { Repository, Model, Schema } from "@lmstudios/data";
import { ContextControl, ModelTree, ModelNode } from "./";
import { ModelPropertyControl } from "./Properties";

@Component({
    selector:"repository-control",
    templateUrl:"Repository.html",
    styleUrls:["Repository.css"]
})
export class RepositoryControl implements OnInit {
	constructor() { 
    }
    public async ngOnInit(){
    }

    private __contextControl?:ContextControl
    public get ContextControl():ContextControl{
        if (this.__contextControl === undefined) throw new Error(``);
        return this.__contextControl;
    }
    @Input() public set ContextControl(value:ContextControl){
        this.__contextControl = value;
    }
    private __repository?:Repository<Model>;
    @Input() public get Repository():Repository<Model>{
        if (this.__repository === undefined) throw new Error(``);
        return this.__repository;
    }
    public set Repository(value:Repository<Model>){
        this.__repository = value;          
    }
    public get Table():{Properties:Schema.Property[], Models:Model[] }{
        var result = { Properties:this.Repository.Schema.Properties, Models:this.Repository.Items }
        result.Properties = result.Properties.filter(x => {return !(x.PropertyType instanceof Schema.Model) });
        result.Properties = result.Properties.filter(x => {return x.PropertyType.Name !== "Collection"});
        return result;
    }

    public get ActiveNode():ModelNode|undefined{
        if (this.ContextControl.SelectedModel !== undefined)
            return this.ContextControl.SelectedModel.ActiveNode;
        return undefined;
    }
    public get ActiveModel():Model|undefined{
        if (this.ActiveNode !== undefined)
            return this.ActiveNode.Model;
        return undefined;
    }
    public get Visible():boolean {
        if (this.ActiveNode !== undefined){
            if (this.ActiveNode.Property === undefined) return false;
            else{
                if (this.ActiveNode.Property.PropertyType.Name === "Collection" && this.ActiveNode.Property.PropertyType.GenericTypes !== undefined)
                    return (this.ActiveNode.Property.PropertyType.GenericTypes[0] === this.Repository.Schema);
                else if (this.ActiveNode.Property.PropertyType instanceof Schema.Model)
                    return (this.ActiveNode.Property.PropertyType === this.Repository.Schema);
                else
                    return false;
            }
        }
        return this.ContextControl.SelectedRepository === this.Repository;
    }
    public Select(model:Model){
        if (this.ActiveNode !== undefined){
            if (this.ActiveNode.Property !== undefined){
                this.ActiveNode.Property.SetValue(this.ActiveNode.Model, model);
                this.ActiveNode.Property = undefined;
            }
        }
        else{
            this.ContextControl.SelectedModel = new ModelTree(model);
        }
    }
    public Create(){
        this.ContextControl.SelectedModel = new ModelTree(this.Repository.Add());
    }

    public Log(item:any){
        console.log(item);
    }
}