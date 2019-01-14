import { Type } from "@lmstudios/types";
import { Model } from "./Model";
export declare class Property {
    constructor(model: Model, name: string);
    Initialize(data: any): void;
    Model: Model;
    Name: string;
    PropertyType: Type;
    Required: boolean;
    Principal?: Property;
    Optional?: Property[];
    Relationship?: {
        [name: string]: Property;
    };
    References?: Property[];
    GetValue(item: any): any;
    SetValue(item: any, value: any): void;
}
