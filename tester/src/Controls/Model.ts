import { Component, ElementRef, Inject, Input, Output, EventEmitter } from '@angular/core';
import * as LMS from "@lmstudios/entity";
import * as Controls from "./";

@Component({
	selector: 'ctlModel',
	templateUrl: './Model.html',
	styleUrls: ['./Model.css']
})
export class Model {
	constructor() {
    }
    private __context:LMS.Context|undefined;
    public get context():LMS.Context{
        if (this.__context === undefined)
            this.__context = (<any>window).Context
        if (this.__context === undefined)
            throw new Error("No Context");            
        return this.__context;
    }
    private __value:LMS.Model|Partial<LMS.Model>|number|string|undefined;
    public get value():LMS.Model|Partial<LMS.Model>|number|string|undefined{
        return this.__value;
    }
    @Input() public set value(value:LMS.Model|Partial<LMS.Model>|number|string|undefined){
        this.__value = value;
    }

    private __parent:Controls.Model|Controls.Repository|Controls.Context|undefined;
    public get parent():Controls.Model|Controls.Repository|Controls.Context|undefined{
        return this.__parent;
    }
    @Input() public set parent(value:Controls.Model|Controls.Repository|Controls.Context|undefined){
        this.__parent = value;
    }

    private __parentProperty:LMS.Meta.Property|undefined;
    public get parentProperty():LMS.Meta.Property|undefined{
        return this.__parentProperty            
    }
    @Input() public set parentProperty(value:LMS.Meta.Property|undefined){
        this.__parentProperty = value;
    }

    private __type:string|undefined;
    public get type():string{
        if (this.__type === undefined){
            if (this.value instanceof LMS.Model){
                this.__type = this.value.GetType().Name;
            }
            else if (this.__parentProperty !== undefined){
                if (this.__parentProperty.Type !== undefined){
                    this.__type = this.__parentProperty.Type.Name;
                }                
            }
        }
        if (this.__type === undefined)
            throw new Error("");
        return this.__type;
    }
    @Input() public set type(value:string){
        this.__type = value;
    }


    public get properties():LMS.Meta.Property[]{
        if (this.value instanceof LMS.Model)
            return this.value.GetType().GetProperties();
        return [];
    }
	private __open:boolean = false;
	public set open(value:boolean){
        this.__open = value;
        if (this.__open){
            if (this.type !== undefined && this.value !== undefined && ! (this.value instanceof LMS.Model)){
                var repository = this.context.GetRepository(this.type);
                if (repository === undefined)
                    throw new Error(`ctlModel's context does not have a repository`)
                repository.Select(this.value).then(selection=>{
                    this.value = selection;
                });
            }
        }
    }
    public get open():boolean{
        return this.__open;
    }
    private __selected:boolean = false;
	public get selected():boolean{
        return this.__selected;
        
	}
	public set selected(value:boolean){
        this.__selected = value;
 
        if (this.__selected){
            if (this.type !== undefined && this.value !== undefined && ! (this.value instanceof LMS.Model)){
                var repository = this.context.GetRepository(this.type);
                if (repository === undefined)
                    throw new Error(`ctlModel's context does not have a repository`)
                repository.Select(this.value).then(selection=>{
                    this.value = selection;
                });
            }
            console.log("sent");
            this.select.emit(this);
        }
    }
    @Output() public select:EventEmitter<Controls.Model> = new EventEmitter();



	public get label():string{
        if (this.parentProperty !== undefined)
            return `${this.parentProperty.Name}`;
        return this.type;
    }
    
    public isPrimative(property:LMS.Meta.Property){
        return (!this.isModel(property) && !this.isRepository(property));
     }
    public isModel(property:LMS.Meta.Property){
        return (property.Type && property.Type.IsSubTypeOf(LMS.Model))
    }
    public isRepository(property:LMS.Meta.Property){
        return (property.Type && property.Type.IsSubTypeOf(LMS.Repository))
    }

    @Input() public toggleValue = false; 


    public toggle = function(m:Controls.Model){
        return {
            get value(){return m.toggleValue},
            set value(value){ m.toggleValue = value; console.log(value);},
            click:async ()=>{
                m.toggle.value = !m.toggle.value;
                if (m.toggle.value){
                    if (m.value instanceof LMS.Model)
                        return;
                    else if (m.value !== undefined){
                        var repository = m.context.GetRepository(m.type);
                        if (repository)
                            m.value = await repository.Select(m.value);
                    }                
                }
            }
        }
	}(this);
	public options = {
        add:{
            value:"",
            toggle:{
                value:false,
                click:()=>{
                    this.options.add.toggle.value = !this.options.add.toggle.value;
                }
            },
            actions:{
                add:()=>{console.log("add");},
                cancel:()=>{console.log("cancel")}
            },
            available:()=>{
                return (this.value === undefined || this.value === null);
            }        
        },
        search:{
            toggle:{
                value: false,
                click:()=>{
                    this.options.search.toggle.value = !this.options.search.toggle.value;
                }
            },
            actions:{
                save:()=>{},
                cancel:()=>{}
			},
			value:""
        }
    }
}