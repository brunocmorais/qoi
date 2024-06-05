export class Util {

    static numberToBytes(number: number) {

        return [
            (number & 4278190080) >>> 24,
            (number & 16711680) >>> 16,
            (number & 65280) >>> 8,
            (number & 255) >>> 0,
        ];
    }

    static bytesToNumber(bytes: number[]) {
        
        return bytes[0] << 24 >>> 0 |
               bytes[1] << 16 >>> 0 |
               bytes[2] <<  8 >>> 0 |
               bytes[3];
    }
}
