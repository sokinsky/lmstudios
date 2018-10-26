import { Component, ElementRef, Inject, Input, Host } from '@angular/core';
import * as LMS from "@lmstudios/entity";
import * as Controls from "./";

@Component({
	selector: 'ctlContext',
	templateUrl: './Context.html',
	styleUrls: ['./Context.css']
})
export class Context {
	// constructor() {
    //     //console.log(this);
    // }
    // private __value:LMS.Context|undefined;
    // public get value():LMS.Context{
    //     if (this.__value === undefined)
    //         throw new Error(`ctlContext's value is undefined`);
    //     return this.__value;
    // }
    // @Input() public set value(value:LMS.Context){
    //     this.__value = value;
    // }
    // @Input() public name:string = "Context";

    // public get label():string{
    //     return this.name;
    // }
    // public get properties():LMS.Meta.Property[]{
    //     return this.value.GetType().GetProperties();
    // }

    // public isPrimative(property:LMS.Meta.Property){
    //     return (!this.isModel(property) && !this.isRepository(property));
    //  }
    // public isModel(property:LMS.Meta.Property){
    //     return (property.Type && property.Type.IsSubTypeOf(LMS.Model))
    // }
    // public isRepository(property:LMS.Meta.Property){
    //     return (property.Type && property.Type.IsSubTypeOf(LMS.Repository))
    // }

    // public selectedControl:Controls.Primative|Controls.Model|Controls.Repository|undefined;
    // public select(control:any){
    //     if (this.selectedControl === undefined){
    //         this.selectedControl = control;
    //         return;
    //     }
    //     if (this.selectedControl !== control){
    //         if (this.selectedControl instanceof Controls.Repository){
    //             this.selectedControl.selected = false;
    //         }
    //         this.selectedControl = control;
    //     }
    // }

    // private selectedOption:string|undefined;

    // public SaveChanges(){
    //     console.log("SaveChanges");
    //     //this.value.SaveChanges();
    // }

    // public toggle = {
    //     value:true,
    //     click:()=>{
    //         this.toggle.value = !this.toggle.value;
    //     }
    // }
    // public options = {
    //     save:{
    //         toggle:{
    //             value: false,
    //             click:()=>{
    //                 this.options.save.toggle.value = !this.options.save.toggle.value;
    //             }
    //         },
    //         actions:{
    //             save:()=>{
    //                 this.value.SaveChanges().then((response:LMS.Response|undefined)=>{
    //                     if (response !== undefined){
    //                         if (response.Status.Type === LMS.ResponseStatusType.OK)
    //                             this.options.save.toggle.value = false;
    //                     }
    //                 });
    //             },
    //             cancel:()=>{console.log("cancel")}
    //         },
    //         disabled:()=>{
    //             return (this.value.ChangeTracker.Changes.length == 0);
    //         }
    //     }
    // }

    // public controlState = {
    //     header:{
    //         options:{

    //         }
    //     },
    //     body:{},
    //     footer:{}
    // }

    // public panel = {
    //     header:{
    //         title:{
    //             toggle:{
    //                 status:"closed",
    //                 click:() =>{
    //                     console.log(this.panel);
    //                 }
    //             }
    //         }
    //     },
    //     body:{},
    //     footer:{}
    // }

    // public header = {
    //     title:{
    //         toggle:true,
    //         toolbar:{
    //             buttons:{
    //                 save: {
    //                     status:undefined,
    //                     click:function(){
    //                         console.log(this);
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // }
}