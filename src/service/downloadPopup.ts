import { POPUP_CONTENT } from "../utils/constants";
import {
  getRegion,
  mergeObject,
  isFunction,
  getCookie,
  click,
  exposure,
} from "../utils/utils";

const COMMON_ID = "lzd-call-app-download-popup";
const STAY_BUTTON_ID = `${COMMON_ID}-stay`;
const INSTALL_BUTTON_ID = `${COMMON_ID}-install`;
const CLOST_BUTTON_ID = `${COMMON_ID}-close`;

const FREQUENCY_COOKIE = `${COMMON_ID}-cookie`;

// 上报logkey
const EXPOSURE_KEY = "/smb.delivery.popup_exposure";
const STAY_KEY = "/smb.delivery.popup_stay";
const INSTALL_KEY = "/smb.delivery.popup_install";
const CLOSE_KEY = "/smb.delivery.popup_close";

// 组装样式字符串
const getStyle = (): any => {
  const styleConf = {
    mask: {
      position: "fixed",
      width: "100%",
      height: "100%",
      top: 0,
      left: 0,
      "background-color": "rgba(0,0,0,0.6)",
      "z-index": 10000,
    },
    wrap: {
      display: "flex",
      position: "absolute",
      bottom: 0,
      left: 0,
      "background-color": "#fff",
      "border-radius": "12px 12px 0px 0px;",
      "flex-direction": "column",
      "align-items": "center",
      padding: "9px 12px",
      color: "#000",
      "font-size": "18px",
      "line-height": 1.5,
      "font-family": "-apple-system, Roboto, system-ui",
      "text-align": "center",
      "box-sizing": "border-box",
      width: "100%",
    },
    img: {
      width: "66px",
      height: "66px",
      "margin-top": "11px",
      "margin-bottom": "15px",
    },
    descStyle: {
      padding: "0 18px",
    },
    buttonWrap: {
      display: "flex",
      "font-size": "16px",
      "font-weight": 500,
      "margin-top": "15px",
    },
    buttonStay: {
      width: "171px",
      height: "39px",
      "line-height": "39px",
      border: "1px solid #FE4960",
      "border-radius": "25px",
      "margin-right": "9px",
      color: "#FE4960",
      "box-sizing": "border-box",
    },
    buttonInstall: {
      width: "171px",
      height: "39px",
      "line-height": "39px",
      background:
        "linear-gradient(90.28deg, #FF933F 0.25%, #F93782 68.5%, #F93782 99.76%)",
      "border-radius": "25px",
      color: "#FFFFFF",
      "box-sizing": "border-box",
    },
    close: {
      width: "15px",
      height: "15px",
      position: "absolute",
      top: "20px",
      right: "15px",
    },
  };

  for (let key in styleConf) {
    let style = styleConf[key];
    let str = "";
    for (let k in style) {
      str += `${k}: ${style[k]};`;
    }
    styleConf[key] = str;
  }

  return styleConf;
};

// 组装模版
const buildTemplate = (content: PopupContent): string => {
  const { icon, desc, stayText, installText } = content;
  const {
    mask,
    wrap,
    img,
    buttonWrap,
    buttonStay,
    buttonInstall,
    descStyle,
    close,
  } = getStyle();

  return `
  <div style="${mask}">
    <div style="${wrap}">
      <img style="${img}" src="${icon}" />
      <p style="${descStyle}">${desc}</p>
      <div style="${buttonWrap}">
        <div id="${STAY_BUTTON_ID}" style="${buttonStay}">${stayText}</div>
        <div id="${INSTALL_BUTTON_ID}" style="${buttonInstall}">${installText}</div>
      </div>
      <img id="${CLOST_BUTTON_ID}" style="${close}" src="//lzd-img-global.slatic.net/g/tps/imgextra/i4/O1CN01IQx3u61kWz5hxfCTe_!!6000000004692-2-tps-60-60.png" />
    </div>
  </div>
  `;
};

// 获取弹窗容器
const getContainer = (): Element => {
  let container = document.querySelector(`#${COMMON_ID}`);
  if (!container) {
    container = document.createElement("div");
    container.setAttribute("id", COMMON_ID);
    container.setAttribute("class", COMMON_ID);
    container.setAttribute("ignorefspcollection", "true");
    document.body.appendChild(container);
  }
  return container;
};

// 关闭弹窗
const closePopup = (): void => {
  const container = getContainer();
  container.innerHTML = "";
};

// 绑定事件
const bindEvent = (ins: any, config: PopupConfig): void => {
  const stayButton = document.querySelector(`#${STAY_BUTTON_ID}`);
  const installButton = document.querySelector(`#${INSTALL_BUTTON_ID}`);
  const closeButton = document.querySelector(`#${CLOST_BUTTON_ID}`);

  const { installCallback, stayCallback, closeCallback } = config;

  stayButton?.addEventListener("click", (): void => {
    click(STAY_KEY);
    isFunction(stayCallback) && stayCallback(ins);
    closePopup();
  });

  installButton?.addEventListener("click", (): void => {
    click(INSTALL_KEY);
    if (isFunction(installCallback)) {
      installCallback(ins);
    } else {
      ins?.redirectDownload();
    }
    closePopup();
  });

  closeButton?.addEventListener("click", (): void => {
    click(CLOSE_KEY);
    isFunction(closeCallback) && closeCallback(ins);
    closePopup();
  });
};

// 获取弹窗展示次数限制
const getLimit = (config: PopupConfig): any => {
  const { frequency = 3 } = config;
  const times: number = parseInt(getCookie(FREQUENCY_COOKIE)) || 0;
  let shouldDisplay = false;

  if (times < frequency) {
    shouldDisplay = true;
  }

  return {
    shouldDisplay,
    times,
  };
};

// 更新展示次数
const updateDisplayTimes = (times: number) => {
  const expiredTime = new Date(
    new Date().setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000 - 1
  ).toUTCString();

  document.cookie = `${FREQUENCY_COOKIE}=${times + 1};expires=${expiredTime}`;
};

// 展示用户选择弹窗
export const downloadPopup = (ins: any): void => {
  const region = getRegion();
  const popupConfig = ins?.options?.popupConfig ?? {};
  // 合并配置
  const config: PopupConfig = mergeObject(
    { contentConfig: POPUP_CONTENT, frequency: 3, off: false },
    popupConfig
  );
  const content = config?.contentConfig?.[region] ?? {};

  const { shouldDisplay, times } = getLimit(config);

  // 是否超出展示次数限制
  if (shouldDisplay && !config.off) {
    const template = buildTemplate(content);
    const container = getContainer();

    container.innerHTML = template;

    bindEvent(ins, config);

    exposure(EXPOSURE_KEY, {});

    updateDisplayTimes(times);
  }
};
