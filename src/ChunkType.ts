export enum ChunkType {
    QOI_OP_RGB = 0xFE,
    QOI_OP_RGBA = 0xFF,
    QOI_OP_INDEX = 0b00,
    QOI_OP_DIFF = 0b01,
    QOI_OP_LUMA = 0b10,
    QOI_OP_RUN = 0b11
}
