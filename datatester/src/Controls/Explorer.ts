import { ContentChildren, AfterViewInit,  ViewContainerRef, ViewRef, Component, ElementRef, Inject, Input, Output, ViewChildren, EventEmitter, ViewChild, QueryList } from '@angular/core';
import * as LMStudios from "@lmstudios/data";
import { Tree, TreeNode, TreeView } from "./";

@Component({
	selector: 'explorer',
	templateUrl: './Explorer.html',
	styleUrls: ['./Explorer.css']
})
export class Explorer implements AfterViewInit {
    constructor() { }  
    ngAfterViewInit() {
    }
    @ViewChild("tree") public Tree?:Tree;
    @ViewChild("view") public View?:TreeView;

    @Input() public context?:LMStudios.Context;
    
    // @ViewChild(TreeView) public TreeView?:TreeView;

    public selectedNode?:TreeNode;
    public selectNode(node:TreeNode){
        this.selectedNode = node;
        if (this.View !== undefined){
            this.View.selectedItem = this.selectedNode.value;
        }
        
    }
}