declare module 'html2canvas' {
  export interface Html2CanvasOptions {
    /** 缩放比例，默认为 1 */
    scale?: number;
    /** 是否允许跨域图片 */
    useCORS?: boolean;
    /** 背景颜色 */
    backgroundColor?: string;
    /** 是否启用日志 */
    logging?: boolean;
    /** 是否允许外部图片 */
    allowTaint?: boolean;
    /** 代理 URL */
    proxy?: string;
    /** 渲染超时时间 */
    timeout?: number;
    /** 是否忽略元素的背景图片 */
    ignoreElements?: (element: HTMLElement) => boolean;
    /** 宽度 */
    width?: number;
    /** 高度 */
    height?: number;
    /** x 坐标 */
    x?: number;
    /** y 坐标 */
    y?: number;
    /** 窗口宽度 */
    windowWidth?: number;
    /** 窗口高度 */
    windowHeight?: number;
    /** 滚动 x 坐标 */
    scrollX?: number;
    /** 滚动 y 坐标 */
    scrollY?: number;
    /** 外部字体 */
    foreignObjectRendering?: boolean;
    /** 是否移除容器背景 */
    removeContainer?: boolean;
    /** 克隆文档时的回调函数 */
    onclone?: (clonedDoc: Document, clonedElement: HTMLElement) => void;
  }

  export interface Html2Canvas {
    (element: HTMLElement, options?: Html2CanvasOptions): Promise<HTMLCanvasElement>;
  }

  const html2canvas: Html2Canvas;
  export default html2canvas;
} 