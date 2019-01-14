export declare class API {
    constructor(domain: string);
    Domain: string;
    Responses: Response[];
    Post(path: string, body: any): Promise<Response | undefined>;
}
