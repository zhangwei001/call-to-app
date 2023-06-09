interface DebugOptions {
  debug: boolean;
}

export default (instance: Core, debugOptions: DebugOptions) => {
  const { debug } = debugOptions;

  if (!debug) return;

  instance.on("created", (ins: Core) => {
    console.log("---lzd-call-app created---", ins);
  });

  instance.on("beforeEvoke", (ins: Core, appInfo: AppInfo) => {
    console.log("---lzd-call-app beforeEvoke---", ins, appInfo);
  });

  instance.on("evokeSuccess", (ins: Core, appInfo: AppInfo) => {
    console.log("---lzd-call-app evokeSuccess---", ins, appInfo);
  });

  instance.on("evokeFailed", (ins: Core, appInfo: AppInfo) => {
    console.log("---lzd-call-app evokeFailed---", ins, appInfo);
  });
};
