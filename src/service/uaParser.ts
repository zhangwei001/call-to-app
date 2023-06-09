import { testUA } from "../utils/utils";

import { CHROME, SAFARI, IOS_BROWSER_VERSION, SAMSUNG } from "../utils/regexp";
import {
  IOS,
  IOS_VERSION,
  MAC_OS,
  ANDROID,
  WINDOWS,
  ANDROID_VERSION,
} from "../utils/regexp";

import {
  METHOD_TAG_A,
  METHOD_IFRAME,
  METHOD_LOCATION,
} from "../utils/constants";

export const isIOS: boolean = testUA(IOS);

export const isAndroid: boolean = testUA(ANDROID);

export const isWindows: boolean = testUA(WINDOWS);

export const isMacOS: boolean = testUA(MAC_OS);

export const isPC: boolean = !isIOS && !isAndroid;

export const islazada: boolean = testUA(/lazada/i);

export const isAliApp: boolean = testUA(/AliApp/i) || islazada;

export const isMobile: boolean = testUA(
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Opera Mobi|Kindle/i
);

/**
 * 解析系统信息
 * @param {string} ua - navigator.userAgent
 * @returns {System}
 */
export const getSystem = (ua: string = window.navigator.userAgent): System => {
  const AndroidMatched = ua.match(ANDROID_VERSION) as string[];
  const iosVersionMatched = ua.match(IOS_VERSION) as string[];

  let system: System = {
    name: "unknown",
    version: "0.0.0",
  };

  if (isAliApp) {
    system = {
      isAli: true,
      name: "ali",
      version: "0.0.0",
    };
    if (islazada) {
      system.name = "lazada";
      system.isLazada = true;
    }
  } else if (isPC) {
    system = {
      name: "pc",
      version: "0.0.0",
      isPc: true,
    };
  } else {
    if (isIOS) {
      system = {
        isIOS: true,
        name: "ios",
        version: iosVersionMatched?.[1]?.split?.("_").join(".") || "",
      };
    } else if (isAndroid) {
      system = {
        isAndroid: true,
        name: "android",
        version: AndroidMatched?.[1] || "",
      };
    }
  }

  return system;
};

/**
 * 解析浏览器信息
 * @param {System} system - 解析的系统信息
 * @param {string} ua - navigator.userAgent
 * @returns {Browser}
 */
export const getBrowser = (
  system: System,
  ua: string = window.navigator.userAgent
): Browser => {
  const { isIOS: isIosSystem } = system;
  const ChromeMatched = ua.match(CHROME) as string[];
  const SamsungMatched = ua.match(SAMSUNG) as string[];
  const SafariMatched = ua.match(SAFARI) as string[];
  const SafariVersionMatched = ua.match(IOS_BROWSER_VERSION) as string[];

  let browser: Browser = {
    name: "unknown",
    version: "0.0.0",
  };

  if (ChromeMatched) {
    browser = {
      name: "Chrome",
      isChrome: true,
      version: ChromeMatched?.[1] || "",
    };
  } else if (isIosSystem && SafariMatched) {
    browser = {
      name: "safari",
      version: SafariVersionMatched?.[1] || "",
      isSafari: true,
    };
  } else if (SamsungMatched) {
    browser.isSamsung = true;
  }

  return browser;
};

/**
 * 生成唤端方法
 * @param {System} system - 系统信息
 * @param {Browser} browser - 浏览器信息
 * @returns {Info}
 */
const genMethod = (system: System, browser: Browser): Info => {
  let info: Info = {
    method: METHOD_IFRAME,
    isIntent: false,
  };

  // ios使用a标签
  if (system.isIOS) {
    info.method = METHOD_TAG_A;
  } else if (system.isAndroid && browser.isChrome) {
    // android使用location重定向
    info.method = METHOD_LOCATION;
    // version >= 25 使用intent协议 intentLink
    // https://developer.chrome.com/multidevice/android/intents
    const major = parseInt(browser.version.split(".")[0]);
    if (major >= 25) {
      info.isIntent = true;
    }
  }

  return info;
};

/**
 * 解析ua输出系统、浏览器、唤端方法信息
 * @param {string} ua - navigator.userAgent
 * @returns {AppInfo}
 */
const uaParser = (ua: string = window.navigator.userAgent): AppInfo => {
  const system = getSystem(ua);
  const browser = getBrowser(system);
  const info = genMethod(system, browser);
  return {
    system,
    browser,
    ...info,
  };
};

export default uaParser;
