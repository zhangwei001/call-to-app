import Core from "../core";
import { GLOBAL_CONFIG_KEY } from "../utils/constants";
import { isFunction } from "../utils/utils";
import { isAliApp, isMobile } from "../service/uaParser";

declare const window: any;

interface GcpOptions extends Options {
  sticky?: boolean;
  img?: string;
  onClick?: Function;
}

export default class CallApp extends Core {
  constructor(options: GcpOptions) {
    super(options);

    this.options = this.genConfig(this.options);

    this.create();
    this.readStrategy();
  }

  // 根据策略决定唤端策略
  readStrategy() {
    const {
      strategy: { disableSmb, autoOpen, autoDownloadAfterAutoOpen },
    } = this;

    if (window.__isSSR) {
      return;
    }

    if (window.__gcp_smb_flag__) {
      return null;
    }
    window.__gcp_smb_flag__ = true;

    // smb被禁用
    if (disableSmb) return;

    // aliapp内不显示smb
    if (isAliApp) return;

    // 仅在移动端展示
    if (!isMobile) return;

    this.initUI(this.options);

    // 需要自动唤端
    if (autoOpen) {
      this.evokeApp({
        autoType: 1,
        needDownloadOnce: autoDownloadAfterAutoOpen,
      });
    }
  }

  // 初始化smb的ui
  initUI(config: GcpOptions = {}): void {
    const sticky = config.sticky
      ? "position: sticky; position: -webkit-sticky;"
      : "";
    const styleContainer = `width: 7.5rem; height: 1.5rem; z-index: 1000; ${sticky} top: 0;`;
    const styleBanner = `width: 7.5rem; height: 1.5rem; background-size: 100%; font-size: 20px; background-image: url(${config.img});`;

    let div: any = document.createElement("div");
    div.innerHTML = `<div class="smart-banner-out" ignoreFspCollection="true" style="${styleContainer}">
      <div class="smart-banner" style="${styleBanner}"></div>
    </div>`;
    div.firstElementChild &&
      div.firstElementChild.addEventListener(
        "click",
        (event) => {
          if (isFunction(config.onClick)) {
            config.onClick(this, event);
          }
        },
        false
      );

    const root = document.querySelector("#content");
    if (root && div.firstElementChild) {
      root.insertBefore(div.firstElementChild, root.firstElementChild);
    }
    div = null;
  }

  genConfig(options: GcpOptions) {
    const globalOptions = window[GLOBAL_CONFIG_KEY] || {};
    const regionID = (window.g_config && window.g_config.regionID) || "sg";
    const region = regionID.toLowerCase();
    const url = encodeURIComponent(location.href);

    const deeplink = `lazada://${region}/web?url=${url}`;
    const intent = `intent://${region}/web?url=${url}#Intent;scheme=lazada;end`;

    const banners = {
      id: "//lzd-img-global.slatic.net/g/tps/images/ims-web/TB1oQdENRr0gK0jSZFnXXbRRXXa.gif",
      th: "//lzd-img-global.slatic.net/g/tps/images/ims-web/TB1ATy2qmslXu8jSZFuXXXg7FXa.jpg",
      ph: "//lzd-img-global.slatic.net/g/tps/images/ims-web/TB1TKsLhSslXu8jSZFuXXXg7FXa.jpg",
      my: "//lzd-img-global.slatic.net/g/tps/images/ims-web/TB1I3STX9slXu8jSZFuXXXg7FXa.gif",
      vn: "//lzd-img-global.slatic.net/g/tps/images/ims-web/TB1dQpkNlr0gK0jSZFnXXbRRXXa.gif",
      sg: "//lzd-img-global.slatic.net/g/tps/images/ims-web/TB1DA1XXCslXu8jSZFuXXXg7FXa.gif",
    };

    const defaultConf: GcpOptions = {
      deeplink,
      intent,
      img: banners[region],
      sticky: true,
      onClick: (instance: Core) => {
        instance.evokeApp({ autoType: 0, needDownloadOnce: true });
      },
    };

    // 配置优先级，全局 > 实例化配置
    return Object.assign({}, options, defaultConf, globalOptions);
  }
}
