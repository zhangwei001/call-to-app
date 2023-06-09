declare interface Browser {
  name: string;
  version: string;
  isChrome?: boolean;
  isSamsung?: boolean;
  isSafari?: boolean;
}

declare interface System {
  name: string;
  version: string;
  isPc?: boolean;
  isAndroid?: boolean;
  isIPhone?: boolean;
  isIPad?: boolean;
  isIOS?: boolean;
  isAli?: boolean;
  isLazada?: boolean;
}

declare interface EvokeParams {
  autoType?: number;
  needDownloadOnce?: boolean;
}

declare interface EvokeResult {
  evokeParams?: EvokeParams;
  callParams?: CallParams;
  success: number;
}

declare interface Info {
  method: string;
  isIntent: boolean;
}
declare interface AppInfo extends Info {
  system: System;
  browser: Browser;
}

declare interface CallParams extends AppInfo {
  deeplink: string;
  intent: string;
}

declare interface Options {
  from?: string;
  needDownload?: boolean;
  timeout?: number;
  deeplink?: string;
  intent?: string;
  iosStore?: string;
  androidStore?: string;
  debug?: boolean;
  popupConfig?: PopupConfig;
}

declare interface PopupConfig {
  off?: boolean;
  frequency?: number;
  contentConfig?: ContentConfig;
  stayCallback?: Function;
  installCallback?: Function;
  closeCallback?: Function;
}

declare type ContentConfig = {
  [key in "id" | "my" | "ph" | "sg" | "th" | "vn"]: PopupContent;
};

declare interface PopupContent {
  icon: string;
  desc: string;
  stayText: string;
  installText: string;
}

declare interface Strategy {
  autoOpen?: boolean;
  disableSmb?: boolean;
  autoDownloadAfterAutoOpen?: boolean;
}

declare class Core {
  hooksMap: { [key: string]: Function[] };
  appInfo: AppInfo;
  evokeParams: EvokeParams;
  strategy: Strategy;
  callParams: CallParams;

  options: Options;

  constructor(options: Options);
  public on(name: string, callback: Function): void;
  public addParams(params: any): string;
  public evokeApp(params?: any): void;
  public redirectDownload(storeUrl?: string): void;
}
