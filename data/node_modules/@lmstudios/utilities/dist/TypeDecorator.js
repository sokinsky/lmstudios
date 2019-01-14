import { Type } from "./Type";
export function TypeDecorator(uid) {
    console.log(uid);
    return function (target) {
        target.prototype.typeUID = uid;
        Type.Create(target);
        console.log("here");
    };
}
//# sourceMappingURL=TypeDecorator.js.map