import {
  isPlainObject,
  isFunction,
  deepClone,
  getDefaultDeeplink,
  getDownloadUrl,
  getCookie,
  isSMBDisabled,
  isPaidTraffic,
  isShareUrl,
  isSEO,
  isSearchBots,
  addQueryParams,
} from "./utils/utils";
import { GLOBAL_CONFIG_KEY, SMB_STRATEGY_KEY } from "./utils/constants";

import checkOpen from "./service/checkOpen";
import uaParser from "./service/uaParser";
import { isAliApp, isIOS } from "./service/uaParser";

import {
  evokeByIframe,
  evokeByLocation,
  evokeByTagA,
} from "./service/evokeMethods";

import { HOOKS, METHOD_TAG_A, METHOD_LOCATION } from "./utils/constants";

import { reportExposure, report } from "./service/report";

import { downloadPopup } from "./service/downloadPopup";

const defaultEvokeParams = {
  autoType: 0,
  needDownloadOnce: false,
};

export default class CallApp {
  protected hooksMap: { [key: string]: Function[] };
  protected appInfo: AppInfo;
  protected evokeParams: EvokeParams;
  protected strategy: Strategy;
  protected callParams: CallParams;

  options: Options;

  constructor(options: Options) {
    // 合并选项参数
    this.options = this.mergeOptions(options);

    // 初始化生命周期
    this.hooksMap = HOOKS.reduce((acc, cur) => {
      acc[cur] = [];
      return acc;
    }, {} as { [k: string]: any });

    // 存储设备信息
    this.appInfo = uaParser();

    // 初始化唤端需要使用的数据
    this.callParams = deepClone(this.appInfo);

    // 唤端方法参数
    this.evokeParams = defaultEvokeParams;

    // 解析唤端策略
    this.strategy = this.getStrategy();
  }

  create(): void {
    this.callHook("created");

    // 默认曝光上报
    reportExposure();
  }

  // 合并选项参数
  protected mergeOptions(options: Options): Options {
    const { deeplink, intent } = getDefaultDeeplink();
    const downloadUrl = getDownloadUrl();

    const globalConfig = isPlainObject(window[GLOBAL_CONFIG_KEY])
      ? window[GLOBAL_CONFIG_KEY]
      : {};

    // 默认选项参数
    const defaultOpt: Options = {
      from: "callapp",
      timeout: 2000,
      needDownload: false,
      iosStore: downloadUrl,
      androidStore: downloadUrl,
      deeplink,
      intent,
    };

    return Object.assign({}, defaultOpt, options, globalConfig);
  }

  // 解析唤端策略
  protected getStrategy(): Strategy {
    let result = {
      disableSmb: false,
      autoOpen: false,
      autoDownloadAfterAutoOpen: false,
    };
    // 优先级： disbled > smb strategy > paid traffic || share url
    const isPaid = isPaidTraffic();
    const isShare = isShareUrl();
    const isDisable = isSMBDisabled();
    const hasCookie = getCookie(SMB_STRATEGY_KEY);
    const [
      disableSmb = false,
      autoOpen = true,
      autoDownloadAfterAutoOpen = false,
    ] =
      getCookie(SMB_STRATEGY_KEY)
        ?.split?.("_")
        ?.map?.((s: string) => s === "1") || [];

    if (hasCookie) {
      result = { disableSmb, autoDownloadAfterAutoOpen, autoOpen };
    } else if (isPaid || isShare) {
      result.autoOpen = true;
    }

    // Specifically for seo
    // if (isSEO() || isSearchBots()) {
    //   result.autoOpen = false;
    // }

    // seo禁用smb
    if (isDisable || isSEO() || isSearchBots()) result.disableSmb = true;

    return result;
  }

  // 调用生命周期
  callHook(name: string, params?: any): void {
    this.hooksMap[name].forEach((h: Function) => h(this, params));
  }

  // 重置callParams
  resetCallParams(): CallParams {
    const {
      options: { deeplink, intent },
    } = this;
    return (this.callParams = Object.assign({}, deepClone(this.appInfo), {
      deeplink,
      intent,
    }));
  }

  // 唤起app
  protected callApp(method: string, url: string): void {
    if (method === METHOD_TAG_A) evokeByTagA(url);
    else if (method === METHOD_LOCATION) evokeByLocation(url);
    else evokeByIframe(url);
  }

  // 监听生命周期事件
  on(name: string, callback: Function): void {
    if (this.hooksMap[name] && isFunction(callback)) {
      this.hooksMap[name].push(callback);
    }
  }

  // 开始唤端
  evokeApp(evokeParams?: EvokeParams): Promise<EvokeResult> {
    const defaultParams = Object.assign({}, defaultEvokeParams, evokeParams);
    this.evokeParams = defaultParams;

    const { needDownloadOnce } = defaultParams;
    const {
      options: { needDownload },
    } = this;
    const { autoType } = defaultParams;

    const evokeResult: EvokeResult = {
      evokeParams,
      success: 0,
    };

    return new Promise((resolve, reject) => {
      // 若在lazada/aliapp中，禁止唤端
      if (isAliApp) {
        resolve(evokeResult);
        return;
      }

      // 每次唤端前都重置callParams对象
      this.resetCallParams();

      this.callHook("beforeEvoke", this.callParams);

      // 唤端上报
      report(this);

      const {
        callParams: { isIntent, method, deeplink, intent },
        options: { timeout },
      } = this;

      evokeResult.callParams = this.callParams;

      if (deeplink && intent) {
        const url = isIntent ? intent : deeplink;
        this.callApp(method, url);

        // 检查唤端是否成功
        checkOpen(timeout)
          .then((success) => {
            if (success) {
              this.callHook("evokeSuccess", this.callParams);
              evokeResult.success = 1;
            } else {
              this.callHook("evokeFailed", this.callParams);
              // 全局/单次设置自动唤端失败跳转下载页
              if (needDownload || needDownloadOnce) this.redirectDownload();
              // 否则默认展示用户选择弹窗
              else if (!needDownload && autoType === 1) downloadPopup(this);
            }
            // 返回此次唤端操作结果
            resolve(evokeResult);
          })
          .catch((e) => {
            this.callHook("evokeFailed", this.callParams);
            resolve(evokeResult);
          });
      } else {
        resolve(evokeResult);
      }
    });
  }

  // 跳转到下载页
  redirectDownload(storeUrl?: string) {
    const {
      options: { iosStore = "", androidStore = "" },
    } = this;

    let url = isIOS ? iosStore : androidStore;

    if (storeUrl) url = storeUrl;

    window.location.href = url;
  }

  // 在唤端链接上添加参数
  addParams(params: any): void {
    const {
      callParams: { deeplink, intent },
    } = this;

    this.callParams.deeplink = addQueryParams(deeplink, params);
    this.callParams.intent = addQueryParams(intent, params);
  }
}
