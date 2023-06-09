import { SITE_CONFIG } from "./constants";
const _toString = Object.prototype.toString;

declare const window: any;

/**
 * 是否Object类型
 * @param {any} type - 检测对象
 * @returns {boolean}
 */
export function isPlainObject(type: any): boolean {
  return _toString.call(type) === "[object Object]";
}

/**
 * 是否boolean类型
 * @param {any} type - 检测对象
 * @returns {boolean}
 */
export function isBoolean(type: any): type is Boolean {
  return _toString.call(type) === "[object Boolean]";
}

/**
 * 使用传递的正则表达式校验ua
 * @param {RegExp} reg - 正则表达式
 * @returns {boolean}
 */
export const testUA = (reg: RegExp): boolean =>
  reg.test((navigator && navigator.userAgent) || "");

/**
 * 判断是否是函数
 * @param {any} fun
 * @returns {boolean}
 */
export function isFunction(fun: any): fun is Function {
  return typeof fun === "function";
}

/**
 * 将对象转换为query string
 * @param {object} obj object对象
 * @returns {string} 拼接好的query字符串
 */
export function toQueryString(obj: any): string {
  return Object.keys(obj)
    .filter((k) => {
      const s = encodeURIComponent(obj[k]);
      return s && s !== "null" && s !== "undefined";
    })
    .map((k) => {
      return k + "=" + encodeURIComponent(obj[k]);
    })
    .join("&");
}

/**
 * 在链接上拼接query string
 * @param {url} url origin url
 * @param {object} kv a flaten K-V object containing query key-value pairs
 * @returns {string} 拼接好的url链接
 */
export function appendQuery(url: string, kv: any): string {
  const str: string = toQueryString(kv);
  return `${url}${url.indexOf("?") < 0 ? "?" : "&"}${str}`;
}

/**
 * 根据域名获取国家
 * @returns {string} 国家region
 */
export function getRegion(): string {
  const hostname = location.hostname;
  const { regionID = "sg" } =
    SITE_CONFIG.find((s) => hostname.indexOf(s.domain) > -1) || {};
  return regionID.toLocaleLowerCase();
}

/**
 * 生成默认的deeplink和intent
 * @returns {Object} deeplink，intent
 */
export function getDefaultDeeplink(): { [key: string]: string } {
  const region = getRegion();
  const url = encodeURIComponent(location.href);
  return {
    deeplink: `lazada://${region}/web?url=${url}`,
    intent: `intent://${region}/web?url=${url}#Intent;scheme=lazada;end`,
  };
}

/**
 * 解析url对象
 * @param {string} key - query key
 * @param {string} [url=location.search] - url, default to location.search
 * @return {string} query param value
 */
export function getQuery(key: string, url = window.location.search): string {
  url = url || window.location.search;
  const hashIndex = url.indexOf("#");
  if (hashIndex > 0) {
    url = url.substring(0, hashIndex);
  }

  const keyMatches = url.match(
    new RegExp(`[?|&]${encodeURIComponent(key)}=([^&]*)(&|$)`)
  );
  if (keyMatches && keyMatches[1] === "%s") {
    return keyMatches[1];
  }
  return keyMatches ? decodeURIComponent(keyMatches[1]) : "";
}

/**
 * 获取下载链接
 * @param {string} region
 * @return {string}
 */
export const getDownloadUrl = (): string => {
  const region = getRegion();
  const APP_DOWNLOAD_LINK = {
    id: "https://c.lazada.co.id/t/traceAndDownload?lpUrl={lp}",
    th: "https://c.lazada.co.th/t/traceAndDownload?lpUrl={lp}",
    my: "https://c.lazada.com.my/t/traceAndDownload?lpUrl={lp}",
    ph: "https://c.lazada.com.ph/t/traceAndDownload?lpUrl={lp}",
    sg: "https://c.lazada.sg/t/traceAndDownload?lpUrl={lp}",
    vn: "https://c.lazada.vn/t/traceAndDownload?lpUrl={lp}",
  };
  const url = APP_DOWNLOAD_LINK[region] || APP_DOWNLOAD_LINK["sg"];
  const options = {
    lp: encodeURIComponent(window.location.href),
  };

  // eslint-disable-next-line max-len
  const downloadUrl = url.replace(
    /(\{([a-zA-Z]\w+)\})/g,
    (_, __, key) => options[key] || ""
  );

  return downloadUrl;
};

/**
 * 获取指定key的cookie值
 * @param {string} key
 * @return {string}
 */
export function getCookie(key: string): string {
  let result = {};
  const cookies = document.cookie ? document.cookie.split("; ") : [];

  for (let i = 0; i < cookies.length; i++) {
    const [cookieKey = "", ...value] = cookies[i].split("=");

    if (cookieKey && value) {
      result[cookieKey] = value?.join("=") || "";
    }
  }

  return key ? result[key] || "" : result;
}

/**
 * smb是否被禁用
 * @return {boolean}
 */
export function isSMBDisabled(): boolean {
  return (
    getQuery("disable_smb") === "true" ||
    getCookie("disable_smb") === "true" ||
    getQuery("disable_deeplink") === "true"
  );
}

/**
 * 是否付费流量
 * @return {boolean}
 */
export function isPaidTraffic(): boolean {
  const url: string = location.href;
  return [
    "exlaz",
    "laz_trackid",
    "c.lazada",
    "c.lzd",
    "gclid",
    "/marketing/",
  ].some((str) => url.indexOf(str) > -1);
}

/**
 * 是否分享链接
 * @return {boolean}
 */
export function isShareUrl(): boolean {
  return location.search.indexOf("laz_share_info") > -1;
}

/**
 * if is SEO traffic
 * @returns {boolean}
 */
export function isSEO(): boolean {
  return /google/.test(document.referrer) && !isPaidTraffic();
}

/**
 * if is search engine bot
 * @returns {boolean}
 */
export function isSearchBots(): boolean {
  const SEARCH_BOTS = [
    "Googlebot",
    "slurp",
    "Bingbot",
    "Baiduspider",
    "YandexBot",
    "Teoma",
    "NaverBot",
  ];
  let isBots = false;
  const ua = navigator.userAgent.toLowerCase();

  SEARCH_BOTS.forEach((bot) => {
    if (ua.indexOf(bot.toLowerCase()) >= 0) {
      isBots = true;
    }
  });
  return isBots;
}

/**
 * 深复制
 * @param {any} params 需要复制的对象
 * @return {any}
 */
export function deepClone(params: any): any {
  return typeof params !== "object"
    ? params
    : JSON.parse(JSON.stringify(params));
}

/**
 * 添加query参数
 * @param {string} url 链接
 * @param {any} params 需要添加的参数对象
 * @return {string}
 */
export function addQueryParams(url: string, params: any): string {
  try {
    const u = new URL(url);
    u.search = appendQuery(u.search, params);
    return u.toString();
  } catch (e) {
    return url;
  }
}

/**
 * 深度合并两个对象
 * @param {any} target 对象1
 * @param {array} sources 需要合并的多个对象
 * @return {object}
 */
export function mergeObject<T>(target: T, ...sources: any[]): T {
  for (let source of sources) {
    for (let key in source) {
      if (isPlainObject(source[key])) {
        mergeObject(target[key], source[key]);
      } else if (source[key] !== undefined) {
        target[key] = source[key];
      }
    }
  }
  return target;
}

/**
 * 黄金令箭上报
 * @param {string} logKey 上报key
 * @param {string} type
 */
export function _goldlog(logKey: string, type: "EXP" | "CLK", data = {}): void {
  if (!logKey) {
    throw new Error("logKey is required");
  }
  const q = window.goldlog_queue || (window.goldlog_queue = []);
  const keys = Object.keys(data);
  const gokey: string[] = [];
  keys.forEach((k) => {
    const key = encodeURIComponent(k);
    const value = encodeURIComponent(data[key]);
    gokey.push(`${key}=${value}`);
  });
  q.push({
    action: "goldlog.record",
    arguments: [logKey, type, gokey.join("&")],
  });
}

/**
 * 曝光上报
 * @param logKey
 * @param data
 */
export function exposure(logKey: string, data = {}): void {
  _goldlog(logKey, "EXP", data);
}

/**
 * 点击上报
 * @param {string} logKey
 * @param data
 */
export function click(logKey: string, data = {}): void {
  _goldlog(logKey, "CLK", data);
}
