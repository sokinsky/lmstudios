import { Property } from "./";
export declare class Type {
    constructor();
    readonly UID: string;
    Name: string;
    Namespace: string;
    FullName: string;
    Properties: Property[];
    GetProperty(name: string): Property | undefined;
    BaseType?: Type;
    GenericTypes?: Type[];
    Constructor?: (new (...args: any[]) => any);
    static Create(value: string | (new (...args: any[]) => any)): Type;
    static Parse(uid: string): Type;
    static GetType(value: string): Type | undefined;
    private static getTypes;
}
