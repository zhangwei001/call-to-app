/**
 * 通过 location.href 跳转
 * @param {string} [url] - 需要打开的地址
 */
export const evokeByLocation = (url: string): void => {
  window.location.href = url;
};

/**
 * 通过 iframe 唤起
 * @param {string} [url] - 需要打开的地址
 */
export const evokeByIframe = (url: string): void => {
  const TAG_IFRAME_ID = "lzd-call-app-tag-iframe";
  let tagIframe: HTMLIFrameElement | null = document.querySelector(
    `#${TAG_IFRAME_ID}`
  );

  if (!tagIframe) {
    tagIframe = document.createElement("iframe");
    tagIframe.id = TAG_IFRAME_ID;
    tagIframe.style.cssText = "display:none;border:0;width:0;height:0;";
    document.body.appendChild(tagIframe);
  }

  tagIframe.src = url;
};

/**
 * 通过 A 标签唤起
 * @param {string} url - 需要打开的地址
 */
export const evokeByTagA = (url: string): void => {
  const TAG_A_ID = "lzd-call-app-tag-a";
  let tagA: HTMLAnchorElement | null = document.querySelector(`#${TAG_A_ID}`);

  if (!tagA) {
    tagA = document.createElement("a");
    tagA.id = TAG_A_ID;
    tagA.style.display = "none";
    document.body.appendChild(tagA);
  }

  tagA.setAttribute("href", url);
  tagA.click();
};
