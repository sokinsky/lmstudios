import { Type } from "@lmstudios/types";
import { Context } from "./Context";
import { Key } from "./Key";
import { Property } from "./Property";
export declare class Model {
    constructor(context: Context, type: Type);
    Context: Context;
    Type: Type;
    Properties: Property[];
    GetProperty(name: string): Property | undefined;
    Keys: Key[];
    readonly PrimaryKey: Key;
    readonly PrimaryKeyProperty: Property;
    readonly AdditionalKeys: Key[];
}
