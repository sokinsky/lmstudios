import { Component, ElementRef, Inject, Input, Host } from '@angular/core';
import * as LMS from "@lmstudios/entity";
import * as Controls from "./";
import { Data } from '../STA';

@Component({
	selector: 'ctlTreeNode',
	templateUrl: './TreeNode.html',
	styleUrls: ['./TreeNode.css']
})
export class TreeNode {
    constructor() { }
    private __data:LMS.Context|LMS.Repository<LMS.Model>|LMS.Model|undefined;
    public get data():LMS.Context|LMS.Repository<LMS.Model>|LMS.Model{
        if (this.__data === undefined)
            throw new Error(`ctlTreeNode's data is undefined`);
        return this.__data;
    }
    @Input() public set data(value:LMS.Context|LMS.Repository<LMS.Model>|LMS.Model){

    }    
}