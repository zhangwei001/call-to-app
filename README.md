# 快速上手

## 安装

```javascript
tnpm i @ali/lzd-call-app --save
```

## 使用

### npm

```javascript
// 引入sdk
import LzdCallApp from "@ali/lzd-call-app";

// 初始化实例
const callApp = new LzdCallApp({
  from: "pdp", // 业务id，gcp/campaign/pdp
});

// 唤端
callApp.evokeApp();
```

详细文档：https://yuque.antfin-inc.com/lzdfe/tnyzud/ng0ky3?singleDoc# 《Lazada唤端SDK快速接入文档》
