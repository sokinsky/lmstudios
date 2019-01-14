export class Guid {
    constructor(value) {
        this.Value = "00000000-0000-0000-0000-000000000000";
        if (value)
            this.Value = value;
    }
    toString() {
        return this.Value;
    }
    static Create() {
        var s4 = () => {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        };
        return new Guid(`${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`);
    }
}
//# sourceMappingURL=Guid.js.map