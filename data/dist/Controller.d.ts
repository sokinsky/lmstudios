import { Property } from "@lmstudios/types";
import { Context } from "./Context";
import { Model } from "./Model";
import { ChangeStatus } from "./ChangeTracker";
import { ServerStatus } from "./ServerStatus";
export declare class Controller<TModel extends Model> {
    constructor(context: Context, model: TModel, modelProxy: TModel);
    ID: string;
    Context: Context;
    Model: TModel;
    ModelProxy: TModel;
    Values: {
        Local: Partial<TModel>;
        Server: Partial<TModel>;
        Pending: Partial<TModel>;
    };
    Status: {
        Server: {
            Model?: ServerStatus;
            Properties: {
                [name: string]: ServerStatus;
            };
        };
        Change: {
            Model?: ChangeStatus;
            Properties: {
                [name: string]: ChangeStatus;
            };
        };
    };
    GetValue(value: string | Property): any;
    GetValueAsync(value: string | Property): Promise<any>;
    private getModel;
    private getModelAsync;
    SetValue(propertyValue: string | Property, value: any, fromServer?: boolean): void;
    private setModel;
    generateRelationshipFilter(value: string | Property): any;
    Load(values: Partial<TModel>, fromServer?: boolean): void;
    UpdateChangeStatus(fromServer?: boolean): void;
    Undo(propertyValue?: string | Property): void;
    toString(): string;
    Duplicate(): Promise<Model | undefined>;
    Validate(property?: string | Property): void;
}
