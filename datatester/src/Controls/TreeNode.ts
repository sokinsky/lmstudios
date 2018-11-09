import { Host, ContentChildren, AfterViewInit,  ViewContainerRef, ViewRef, Component, ElementRef, Inject, Input, Output, ViewChildren, EventEmitter, ViewChild, QueryList, Optional } from '@angular/core';
import * as LMStudios from "@lmstudios/data";
import { log } from 'util';

@Component({
	selector: 'treenode',
	templateUrl: './TreeNode.html',
	styleUrls: ['./TreeNode.css']
})
export class TreeNode implements AfterViewInit {
    constructor() { }
    ngAfterViewInit() {
    }
    @ViewChildren("nodes") childNodes?:QueryList<TreeNode>;
    @Output() public select = new EventEmitter();

    public isSelected:boolean = false;
    public selectedNode?:TreeNode;
    public onSelect(){
        this.isSelected = true;
        this.select.emit(this);
    }
    public onChildSelect(childNode:TreeNode){
        this.isSelected = true;
        this.selectedNode = childNode;
        this.select.emit(childNode);
    }
    

    @Input() public parentNode?:TreeNode;    
    @Input() public parentValue?:LMStudios.Model|LMStudios.Context|LMStudios.Repository<LMStudios.Model>|LMStudios.SubRepository<LMStudios.Model>|undefined;
    @Input() public parentProperty?:LMStudios.Meta.Property;
    private __value:any;
    @Input() public set value(value:any){
        this.__value = value;
    }
    public get value():any{
        if (this.__value !== undefined)
            return this.__value;
        if (this.parentProperty !== undefined)
            return this.parentProperty.GetValue(this.parentValue);
        return undefined;
    }  
    @Input() public expanded:boolean = false; 



    public get label():string|undefined{
        if (this.parentProperty !== undefined)
            return this.parentProperty.Name;
        return this.value.toString();
    }

    public expandable():boolean{
        if (this.value instanceof LMStudios.Context || this.value instanceof LMStudios.Model){
            return true;
        }
        else if (this.value instanceof LMStudios.Repository || this.value instanceof LMStudios.SubRepository){
            return this.value.Items.length > 0;
        }
        return false;
    }    

    private __items:{value?:any, parentValue?:any, parentProperty?:LMStudios.Meta.Property}[] = [];
    public get Items():{value?:any, parentValue?:any, parentProperty?:LMStudios.Meta.Property}[]{
        if (this.value !== undefined){
            if (this.value instanceof LMStudios.Model){
                this.value.GetType().GetProperties().forEach(property=>{
                    if (property.Type.IsSubTypeOf(LMStudios.Model)){
                        var exists = this.__items.find(x => { 
                            return x.parentProperty === property && x.parentValue === this.value;
                        });
                        if (exists === undefined)
                            this.__items.push({parentValue:this.value, parentProperty:property});
                    }
                });
            }
            if (this.value instanceof LMStudios.Repository || this.value instanceof LMStudios.SubRepository){
                this.value.Items.forEach(model=>{
                    var exists = this.__items.find(x => {
                        return x.value === model;
                    });
                    if (exists === undefined)
                        this.__items.push({value:model});
                });
            }
        }
        return this.__items;
    }

    public Log(item:any){
        console.log(item);
    }
}