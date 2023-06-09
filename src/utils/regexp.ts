// 系统

export const IOS: RegExp = /iPhone|iPad|iPod/i;

export const IOS_VERSION: RegExp = /OS ([\d_\.]+) like Mac OS X/;

export const MAC_OS: RegExp = /Intel Mac OS X/i;

export const ANDROID: RegExp = /Android|Adr/i;

export const ANDROID_VERSION: RegExp = /Android[\s\/]([\d\.]+)/i;

export const WINDOWS: RegExp = /Windows/i;

export const LAZADA: RegExp = /lazada/i;

export const ALI_APP: RegExp = /AliApp/i;

// 浏览器
export const CHROME: RegExp = /(?:Chrome|CriOS)\/([\d\.]+)/;

export const CHROME_WEBVIEW: RegExp = /Version\/[\d+\.]+\s*Chrome/;

export const SAFARI: RegExp = /Safari\/([0-9\.]+$)/;

export const SAMSUNG: RegExp = /SAMSUNG|Samsung|samsung/i;

export const IOS_BROWSER_VERSION: RegExp = /Version\/([\d\.]+)/;
