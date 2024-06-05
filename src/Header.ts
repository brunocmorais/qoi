import { Channel } from "./Channel"
import { ColorSpace } from "./ColorSpace"

export type Header = {

    width: number,
    height: number,
    channels: Channel,
    colorSpace: ColorSpace
}