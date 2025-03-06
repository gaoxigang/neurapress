declare module 'dom-to-image' {
  export interface DomToImageOptions {
    /**
     * 图片的宽度
     */
    width?: number;
    /**
     * 图片的高度
     */
    height?: number;
    /**
     * 图片的样式
     */
    style?: Record<string, string>;
    /**
     * 图片的质量，范围从 0 到 1
     */
    quality?: number;
    /**
     * 图片的缩放比例
     */
    scale?: number;
    /**
     * 图片的背景颜色
     */
    bgcolor?: string;
    /**
     * 是否使用 CORS
     */
    useCORS?: boolean;
    /**
     * 是否允许污染
     */
    allowTaint?: boolean;
    /**
     * 忽略某些元素的函数
     */
    filter?: (node: Node) => boolean;
    /**
     * 在克隆 DOM 后执行的回调函数
     */
    onclone?: (document: Document, element: HTMLElement) => void;
  }

  /**
   * 将 DOM 节点转换为 PNG 图片
   * @param node 要转换的 DOM 节点
   * @param options 转换选项
   * @returns 返回一个 Promise，解析为 PNG 图片的 data URL
   */
  export function toPng(node: HTMLElement, options?: DomToImageOptions): Promise<string>;

  /**
   * 将 DOM 节点转换为 JPEG 图片
   * @param node 要转换的 DOM 节点
   * @param options 转换选项
   * @returns 返回一个 Promise，解析为 JPEG 图片的 data URL
   */
  export function toJpeg(node: HTMLElement, options?: DomToImageOptions): Promise<string>;

  /**
   * 将 DOM 节点转换为 SVG 图片
   * @param node 要转换的 DOM 节点
   * @param options 转换选项
   * @returns 返回一个 Promise，解析为 SVG 图片的 data URL
   */
  export function toSvg(node: HTMLElement, options?: DomToImageOptions): Promise<string>;

  /**
   * 将 DOM 节点转换为 Blob 对象
   * @param node 要转换的 DOM 节点
   * @param options 转换选项
   * @returns 返回一个 Promise，解析为 Blob 对象
   */
  export function toBlob(node: HTMLElement, options?: DomToImageOptions): Promise<Blob>;

  /**
   * 将 DOM 节点转换为像素数据
   * @param node 要转换的 DOM 节点
   * @param options 转换选项
   * @returns 返回一个 Promise，解析为像素数据
   */
  export function toPixelData(node: HTMLElement, options?: DomToImageOptions): Promise<Uint8ClampedArray>;
} 