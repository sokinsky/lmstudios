import { Model } from "./Model";
import { Property } from "./Property";
export declare class Key {
    constructor(model: Model, init: any);
    Model: Model;
    Name: string;
    Properties: Property[];
}
