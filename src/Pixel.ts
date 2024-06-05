export class Pixel {

    public readonly R: number;
    public readonly G: number;
    public readonly B: number;
    public readonly A: number;

    constructor(r: number, g: number, b: number, a: number) {
        this.R = r;
        this.G = g;
        this.B = b;
        this.A = a;
    }

    public equals(other: Pixel) {
        return this.R === other.R &&
            this.G === other.G &&
            this.B === other.B &&
            this.A === other.A;
    }
}
