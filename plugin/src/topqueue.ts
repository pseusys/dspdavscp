type Cmp<T> = (a: T, b: T) => number;



function defaultCmp(a: unknown, b: unknown): number {
    if (a === b) return 0;
    if (a !== a) return b !== b ? 0 : -1;
    return (b as any) < (a as any) || b !== b ? 1 : -1;
}



export class SortedTopQueue<T> {
    private array: T[];
    private cmp: Cmp<T>;
    private size: number | undefined;

    public constructor(size: number | undefined = undefined, cmp: Cmp<T> = defaultCmp) {
        this.cmp = cmp;
        this.size = size;
        this.array = new Array(size);
    }

    public push(value: T) {
        let inserted = false;
        for (let index = 0; index < this.array.length; index++) if (this.cmp(this.array[index], value) < 0) {
            this.array.splice(index, 0, value);
            inserted = true;
            break;
        }
        if (!inserted && (this.size === undefined || this.array.length < this.size)) this.array.push(value);
        if (this.size !== undefined && this.array.length > this.size) this.array.pop();
    }

    public toArray(): T[] {
        return [...this.array];
    }
}
