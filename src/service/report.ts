declare const window: any;

import { getQuery, getCookie, exposure, click } from "../utils/utils";
// const GOLD_LOG_KEY = "/lzdom.lzd_call_app.click";
const CLICK_KEY = "/smb.delivery.click";
const EXPOSURE_KEY = "/smb.delivery.lp";

/**
 * 获取om flag
 * @return {string} flag
 */
function getOMFlag(): string {
  const s = location.search;
  let ret;
  if (s.indexOf("exlaz") > -1) {
    ret = "exlaz";
  } else if (s.indexOf("laz_trackid") > -1) {
    ret = "laz_trackid";
  } else {
    ret = "none";
  }
  return ret;
}

/**
 * 获取ab信息
 * @return {string} smb_ab string
 */
function getAbTestingBucket(): string {
  return getCookie("smb_ab") || "";
}

/**
 * 默认曝光上报
 */
export function reportExposure(): void {
  const ab = getAbTestingBucket();
  exposure(EXPOSURE_KEY, {
    smb_ab: ab,
    appName: "lzd-call-app",
  });
}

// 统一上报插件
export function report(ins: any): void {
  const ab = getAbTestingBucket();
  const omflag = getOMFlag();
  const dfrom = ins.options.from || "callapp";
  const dsource = "smb";

  // 根据页面平台解析页面链接
  const getReportUrl = (): string => {
    let url = window.location.href;

    if (window.window.g_config) {
      url = getQuery("wh_pid");
    }
    return url;
  };

  // 生成统一上报信息
  const getReportInfo = (instance: Core): any => {
    const {
      appInfo: {
        system: { isAndroid, isIOS },
        browser,
      },
      evokeParams: { autoType },
    } = instance;

    return {
      dsource,
      dauto: autoType ? 1 : 0,
      dfrom,
      deviceType: isAndroid ? "Android" : isIOS ? "iOS" : "unknown",
      omflag,
      browser: browser.name,
      smb_ab: ab,
      exlaz: getQuery("exlaz"),
      exlazCookie: getCookie("exlaz"),
      laz_trackid: getQuery("laz_trackid"),
      laz_share_info: getQuery("laz_share_info") || getCookie("laz_share_info"),
    };
  };

  // 上报信息
  const reportInfo = (instance: Core, lifecycle: string): void => {
    const {
      callParams: { intent, deeplink, isIntent },
    } = instance;
    const schemaLinkEncoded = isIntent
      ? encodeURIComponent(intent)
      : encodeURIComponent(deeplink);

    const info = Object.assign({}, getReportInfo(instance), {
      deepLink: schemaLinkEncoded,
      lifecycle,
    });

    click(CLICK_KEY, info);
  };

  const info = getReportInfo(ins);

  // 唤端链接添加端内上报参数
  ins.addParams(info);

  // 默认唤端上报
  reportInfo(ins, "beforeEvoke");
}
