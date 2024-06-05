import { ChunkType } from "./ChunkType";
import { Header } from "./Header";
import { Pixel } from "./Pixel";
import { Util } from "./Util";

export class Decoder {
    private data: Uint8Array;
    private search: Pixel[];

    constructor(data : Uint8Array) {
        this.data = data;
        this.search = new Array<Pixel>(64);
    }

    private getHeader() {

        const magic = String.fromCharCode(...Array.from(this.data.slice(0, 4)));

        if (magic != "qoif")
            throw new Error("Not a QOI image!");

        const header : Header = {
            width : Util.bytesToNumber(Array.from(this.data.slice(4, 8))),
            height : Util.bytesToNumber(Array.from(this.data.slice(8, 12))),
            channels: this.data[12],
            colorSpace: this.data[13]
        };

        return header;
    }

    private detectChunkType(position : number) {
        const byte = this.data[position];

        switch (byte & 0xFF) {
            case 0xFF: return ChunkType.QOI_OP_RGBA;
            case 0xFE: return ChunkType.QOI_OP_RGB;
            default:
            switch (byte & 0xC0) {
                case 0x00: return ChunkType.QOI_OP_INDEX;
                case 0x40: return ChunkType.QOI_OP_DIFF;
                case 0x80: return ChunkType.QOI_OP_LUMA;
                case 0xC0: return ChunkType.QOI_OP_RUN;
                default: throw new Error("Invalid chunk!");
            }
        }
    }

    public decode() {

        const header = this.getHeader();
        const output : number[] = [];
        let current = new Pixel(0, 0, 0, 255);

        let position = 14;
        let chunkType : ChunkType;

        while (position < this.data.length - 8) {

            chunkType = this.detectChunkType(position);

            switch (chunkType) {
                case ChunkType.QOI_OP_RGB:
                    const rgb = this.data.slice(++position, position += 3);
                    current = new Pixel(rgb[0], rgb[1], rgb[2], current.A);
                    break;
                case ChunkType.QOI_OP_RGBA:
                    const rgba = this.data.slice(++position, position += 4);
                    current = new Pixel(rgba[0], rgba[1], rgba[2], rgba[3]);
                    break;
                case ChunkType.QOI_OP_INDEX:
                    current = this.search[this.data[position++] & 0x3F];
                    break;
                case ChunkType.QOI_OP_RUN:
                    const count = (this.data[position++] & 0x3F);

                    for (let i = 0; i < count; i++)
                        output.push(current.R, current.G, current.B, current.A);
                    
                    break;
                case ChunkType.QOI_OP_DIFF:
                    const diff = this.data[position++] & 0x3F;
                    const dR = ((diff & 0x30) >> 4) - 2;
                    const dG = ((diff & 0xC) >> 2) - 2;
                    const dB = ((diff & 0x3)) - 2;

                    current = new Pixel(
                        (current.R + dR) & 0xFF, 
                        (current.G + dG) & 0xFF,
                        (current.B + dB) & 0xFF, 
                        current.A & 0xFF
                    );

                    break;
                case ChunkType.QOI_OP_LUMA:
                    const luma1 = this.data[position++];
                    const luma2 = this.data[position++];

                    const diffG = (luma1 & 0x3F) - 32;
                    const dRdG = ((luma2 & 0xF0) >> 4) - 8;
                    const dBdG = (luma2 & 0xF) - 8;

                    current = new Pixel(
                        (current.R + dRdG + diffG) & 0xFF, 
                        (current.G + diffG) & 0xFF,
                        (current.B + dBdG + diffG) & 0xFF, 
                        current.A & 0xFF
                    );
            }

            output.push(current.R, current.G, current.B, current.A);
            const index = (current.R * 3 + current.G * 5 + current.B * 7 + current.A * 11) % 64;
            this.search[index] = current;
        }

        return {
            header: header,
            rgba: new Uint8Array(output)
        };
    }
}