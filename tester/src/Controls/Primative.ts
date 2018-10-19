import { Component, ElementRef, Inject, Input, Output, EventEmitter } from '@angular/core';
import * as LMS from "@lmstudios/entity";
import * as Controls from "./";
import { Meta } from '@angular/platform-browser';

@Component({
	selector: 'ctlPrimative',
	templateUrl: './Primative.html',
	styleUrls: ['./Primative.css']
})
export class Primative {
	constructor() {
    }

    private __parent:Controls.Model|Controls.Context|undefined;
    public get parent():Controls.Model|Controls.Context{
        if (this.__parent === undefined)
            throw new Error("ctlPrimative's parent is undefined")
        return this.__parent;
    }
    @Input() public set parent(value:Controls.Model|Controls.Context){
        this.__parent = value;
    }

    private __parentProperty:LMS.Meta.Property|undefined;
    public get parentProperty():LMS.Meta.Property{
        if (this.__parentProperty === undefined)
            throw new Error("ctlPrimative's parentProperty is undefined");
        return this.__parentProperty            
    }
    @Input() public set parentProperty(value:LMS.Meta.Property){
        this.__parentProperty = value;
    }
    public get parentValue():any{
        if (this.parent instanceof Controls.Model)
            return this.parent.value;
        throw new Error("");
    }
    public get value():any{
        var result = this.parentProperty.GetValue(this.parentValue)
        if (result && this.parentProperty.Type && this.parentProperty.Type.Name === "Date"){
            var date = new Date(result);
            result = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`
        }
        return result;
    }
    public set value(value:any){
        this.parentProperty.SetValue(this.parentValue, value);
    }

    private __open:boolean = true;
    public get open():boolean{
        return this.__open;
    }
    public set open(value:boolean){
        this.__open = value;
        console.log(this.value);
    }


    public get input():string{
        if (this.parentProperty.Type){
            return this.parentProperty.Type.Name;
        }
        return "String";
    }
	public get label():string{
		var result:string = `${this.parentProperty.Name}`;
		return result;
    }
    
    public toggle = {
        value:true,
        click:()=>{
            this.toggle.value = !this.toggle.value;
        }
	}
}