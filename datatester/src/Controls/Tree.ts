import { ContentChildren, AfterViewInit,  ViewContainerRef, ViewRef, Component, ElementRef, Inject, Input, Output, ViewChildren, EventEmitter, ViewChild, QueryList } from '@angular/core';
import * as LMStudios from "@lmstudios/data";
import { TreeNode } from "./";

@Component({
	selector: 'tree',
	templateUrl: './Tree.html',
	styleUrls: ['./Tree.css']
})
export class Tree implements AfterViewInit {
    constructor() { }
    ngAfterViewInit() {
    }
    @ViewChildren("nodes") nodes?:QueryList<TreeNode>;
    
    @Input() public context?:LMStudios.Context; 
    
    @Output() public select = new EventEmitter();
    public selectedNode?:TreeNode;
    public selectNode(node:TreeNode){
        this.selectedNode = node;
        this.select.emit(node);
    }
    

    private __items:{value?:any, parentValue?:any, parentProperty?:LMStudios.Meta.Property}[] = [];
    public get Items():{value?:any, parentValue?:any, parentProperty?:LMStudios.Meta.Property}[]{
         if (this.context !== undefined){
            this.context.GetType().GetProperties().forEach(property =>{
                var item = this.__items.find(item => {
                    return item.parentProperty === property;
                })
                if (item === undefined){
                    item = {parentValue:this.context, parentProperty:property};
                    this.__items.push(item);
                }
                item.value = property.GetValue(this.context);                
            })
        }
        return this.__items;
    }
}