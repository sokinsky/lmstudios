import { Type } from "./Type";
export function PropertyDecorator(uid) {
    return function (target) {
        target.prototype.typeUID = uid;
        Type.Create(target);
    };
}
//# sourceMappingURL=PropertyDecorator.js.map