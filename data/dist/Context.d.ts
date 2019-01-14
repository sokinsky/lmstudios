import { Type } from "@lmstudios/types";
import * as Schema from "@lmstudios/schema";
import { API } from "./API";
import { ChangeTracker } from "./ChangeTracker";
import { Model } from "./Model";
import { Repository } from "./Repository";
export declare class Context {
    constructor();
    API: API;
    Tracker: ChangeTracker;
    Schema: Schema.Context;
    Repositories: Repository<Model>[];
    Initialize(): Promise<void>;
    GetRepository(type: string | Type | Schema.Model | Model | (new (...args: any[]) => Model)): Repository<Model>;
    Load(models: {
        ID: string;
        Type: string;
        Value: any;
    }[], fromServer?: boolean): Promise<void>;
    SaveChanges(): Promise<boolean>;
}
