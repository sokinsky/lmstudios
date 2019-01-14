import { Type } from "@lmstudios/types";
import * as Schema from "@lmstudios/schema";
import { Context } from "./Context";
import { Model } from "./Model";
export declare class Repository<TModel extends Model> {
    constructor(context: Context, model: (new (...args: any[]) => TModel));
    GetType(): Type;
    private __items;
    readonly Items: TModel[];
    [Symbol.iterator](): IterableIterator<TModel>;
    Context: Context;
    ModelSchema: Schema.Model;
    Name: string;
    Local: LocalRepository<TModel>;
    Server: ServerRepository<TModel>;
    Create(): TModel;
    Add(value?: TModel | Partial<TModel>, fromServer?: boolean): TModel;
    Remove(value: TModel): void;
    Select(value: Partial<TModel>): Promise<TModel | undefined>;
    Search(...values: any[]): Promise<TModel[]>;
}
export declare class LocalRepository<TModel extends Model> {
    constructor(repository: Repository<TModel>);
    Repository: Repository<TModel>;
    readonly Items: TModel[];
    Select(value: Partial<TModel>): TModel | undefined;
    Search(...values: any[]): TModel[];
}
export declare class ServerRepository<TModel extends Model> {
    constructor(repository: Repository<TModel>);
    Repository: Repository<TModel>;
    Select(value: Partial<TModel>): Promise<TModel | undefined>;
    Search(...values: any[]): Promise<TModel[]>;
}
