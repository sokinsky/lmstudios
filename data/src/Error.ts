export class Error{
    public Message?:string;
    public Description?:string;
    public InnerErrors?:{[name:string]:Error};
}