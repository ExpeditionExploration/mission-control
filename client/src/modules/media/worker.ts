import { H264Decoder } from "./h264decoder/src/index";
const decoder = new H264Decoder();


onmessage = (event) => {
    const result = decoder.decode(new Uint8Array(event.data));
    const data = new Uint8Array(decoder.pic);
    // console.log(result);

    // @ts-ignore
    postMessage(data.buffer, [data.buffer]);
};

export { };