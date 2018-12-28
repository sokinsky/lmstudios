import { Component, OnInit, Input } from "@angular/core";
import { Context, Repository, Model, Response, ResponseStatus } from "@lmstudios/data";
import { RepositoryControl } from "./Repository";
import { Data } from "../STA";

@Component({
    selector:"context-control",
    templateUrl:"Context.html",
    styleUrls:["Context.css"]
})
export class ContextControl implements OnInit {
	constructor() {
    }
    public async ngOnInit(){
    }
    @Input() public Value?:Context;

    public SelectedRepository?:Repository<Model>;
    public SelectedModel?:Model;
    public selectModel(model:Model){
        this.SelectedModel = model;
        this.SelectedRepository = undefined;
    }
    public selectRepository(repository:Repository<Model>){
        this.SelectedRepository = repository;
        this.SelectedModel = undefined;
    }

    public Responses:Response[] = [];
    public async Save(){
        if (this.Value !== undefined){
            var response = await this.Value.SaveChanges();
            if (response !== undefined)
                this.Responses.push(response);
        }
    }

    public isError(response:Response):boolean{
        console.log(response.Status === ResponseStatus.Error);
        return response.Status === ResponseStatus.Error;
    }


    public Log(item:any){
        console.log(item);
    }
    public Json(item:any):string{
        return JSON.stringify(item, null, "\t");
    }
}