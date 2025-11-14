declare module "svg2img" {
  interface Svg2ImgOptions {
    width?: number;
    height?: number;
    preserveAspectRatio?: string;
    background?: string;
  }

  function svg2img(
    svg: string,
    options: Svg2ImgOptions | undefined,
    callback: (error: unknown, buffer: Buffer) => void
  ): void;

  export default svg2img;
}
