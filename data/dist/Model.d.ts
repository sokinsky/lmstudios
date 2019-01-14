import { Type, Property } from "@lmstudios/types";
import * as Schema from "@lmstudios/schema";
import { Context } from "./Context";
import { Controller } from "./Controller";
export declare class Model {
    constructor(context: Context, data?: Partial<Model>);
    __context: Context;
    __type: Type;
    __controller: Controller<Model>;
    Server: {
        [p in keyof this]: Promise<this[p]>;
    };
    GetType(): Type;
    GetSchema(): Schema.Model;
    Delete(): void;
    Load(value: any, server?: boolean): void;
    GetValue(property: string | Property): any;
    SetValue(property: string | Property, value: any): void;
    toString(): string;
    toJson(): string;
    Undo(property?: string | Property): void;
    Validate(): void;
    Duplicate(): Promise<Model | undefined>;
}
