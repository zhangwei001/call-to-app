// 检查页面是否切换到后台
const checkVisibility = (): boolean => {
  return document.hidden || document.visibilityState === "hidden";
};
// 检查是否唤端成功
export default (timeout = 1000): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    try {
      const timeoutId = setTimeout(() => {
        resolve(false);
        clearInterval(intervalId);
      }, timeout);

      // 设置定时器查询是否页面切换到后台
      const intervalId = setInterval(() => {
        const isHidden = checkVisibility();
        if (isHidden) {
          clearInterval(intervalId);
          clearTimeout(timeoutId);
          resolve(true);
        }
      }, 50);
    } catch (e) {
      reject(e);
    }
  });
};
