import { Type } from './Type';
export declare class Property {
    constructor(name: string, type: Type);
    Name: string;
    PropertyType: Type;
    GetValue(item: any): any;
    SetValue(item: any, value: any): void;
}
