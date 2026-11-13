# RHP Finance 本地检阅说明

本次改动仅在本地。未 push、未部署、未修改线上 Strapi schema 或真实财务数据。

## 查看页面

```powershell
npm run dev -- --host 127.0.0.1 --port 3001
```

- `http://127.0.0.1:3001/admin/finance-review`：独立检阅页，只有虚构的 Site 21 与 Site 99，不调用线上会员 API。
- `http://127.0.0.1:3001/admin`：原管理后台 → **RHP Memberships → Annual & Permanent · Finance**。这里使用现有会员资料，本地开发默认仍把财务操作保存到浏览器测试账本。
- 原有会员详情、Guest 列表、其他后台区块保持原有操作方式。它们原本就会连接线上 API；测试财务请优先使用独立检阅页。
- 检阅数据保存在当前浏览器 / origin 的 localStorage，刷新仍保留，换浏览器或端口不会自动共享。不会自动迁移到正式账本。
- 生产构建不会启用演示路由，也不会以 localStorage 代替正式数据库。

## 账本规则

| 期间 | 范围 | 标准应收 |
| --- | --- | --- |
| A | 截至 10/10/2024（含当天） | 未知，依据原业主资料逐笔录入 |
| B | 11/10/2024–10/10/2026 | 2 × A$1,936 = A$3,872 |
| C | 11/10/2026–10/10/2027 | A$1,936，11/10/2026 提前到期应收 |

1. 选择住户，**Open account** 确认三个完整年度的费用后，生成三笔标准 Charge，共 A$5,808；不会自动生成付款或 A 期历史债务。若有住户减免，可用有依据的 Credit 冲销对应收费。
2. Charge：交易日、收费期间、服务起止日、到期日、金额、描述及收费依据。
3. Payment：实际收款日、归属期间、金额、付款人、方式、银行或收据参考号、依据。收款日不决定 A/B/C 归属；跨期付款分开录入并保留相同银行参考号。
4. 每笔金额使用整数分。余额 = Charge − Payment − Credit + Refund。补录早期交易时，按交易日期重新排列并重算 running balance。
5. 不修改或删除原始流水。Credit 关联原 Charge；Refund 关联原 Payment。累计冲销不可超过原金额。录错付款时先冲销，再重新录入正确记录。
6. 未核实的旧业主资料可以先录入并标示 Unverified，之后通过 Verify record 附加核实依据，不覆盖原记录。
7. A 未完全核对前，总余额明确标记为 provisional。Review account 可以在有证据时标记历史已全部核对，包括确认历史无欠款；在这之前不会将未知金额当作完整的零欠款。
8. 自动状态：历史未完成 / 存在未核实记录为 Review；核对完整且有逾期费用为 Overdue；完整且各期间均无欠款为 Current。可人工记录 Disputed、Arrangement 或 Review，并写明原因和下一次付款日。清除人工覆盖请选择 Automatic。
9. ID 按 SiteNumber 显示，例如 RHP-021-A。数据库关联使用会员 documentId；同一 Site 多位会员分别记账，界面提示重复 Site，避免把新旧住户或共同住户静默合并。
10. 支持 CSV statement 与浏览器 Print / Save as PDF。CSV 包含完整交易、依据、创建人员和时间及审核日志。只导出当前住户。

## 后端代码（待检阅后安装）

当前仓库只有前端。已根据打开的 Strapi 会员模型准备 `backend/strapi/src/api/`，新增独立财务表和自定义接口，不重用 Note、CR、fileNameMap 等现有字段。

待审核通过，在 **Strapi 5 服务端项目** 中合入：

- `src/api/rhp-finance/`：路由、控制器、staff policy、共享校验及计算函数。
- `src/api/rhp-finance-event/`：只追加事件表。无公开通用 CRUD 路由，后台内容管理隐藏该表，更新 / 删除 lifecycle 被拒绝。

前端直接引用此目录中的纯业务逻辑 `services/domain.mjs`，因此前端构建时也须保留本仓库的 `backend/` 目录。

服务端环境变量 `RHP_FINANCE_STAFF_TOKENS` 是 JSON 对象，键为可追溯的员工名称，值为每人独立、至少 32 字符的随机访问码。真实值仅保存在服务器配置，**不能放进 VITE_* 环境变量或源码**。员工在 Finance 界面输入自己的访问码，浏览器仅内存保留，刷新需重新输入。未配置、错误凭据均拒绝访问。现有前端共享密码不用于新财务接口鉴权。

`VITE_CMS_ENDPOINT` 沿用现有 Strapi 地址。正式生产构建总是使用 Strapi。若要开发环境连接测试 Strapi，另设 `VITE_FINANCE_LIVE=true`，并从 `/admin` 进入；不要用演示数据作为真实账目。

接口：

- `GET /api/rhp-finance`：仅返回 Annual / Permanent 联系资料与财务流水，排除会员 Password 等无关字段。
- `POST /api/rhp-finance/:memberKey/open`：`{confirmStandardFees:true}`，事务内创建三笔标准收费，唯一键阻止重复开户。
- `POST /api/rhp-finance/:memberKey/events`：`{requestId:UUID,event:{...}}`，校验金额、日期、期间、原始记录及累计冲销额度。唯一 requestId 支持网络重试；数据库行锁序列化同一会员的冲销检查。

所有路由使用独立 staff policy，`auth:false` 只关闭 Strapi 默认内容 API 认证，**不关闭此 policy**。不要移除 policy 或开放事件表的公共权限。修改人员由服务器鉴权结果写入，前端不能伪造。

正式接入前需在独立 Strapi 测试实例安装并检查：实际数据库事务 / 行锁、表的唯一索引、现有 CORS 是否允许 Authorization、员工凭据、真实会员映射、备份及恢复。此轮未安装到线上，因此未声称通过真实 Strapi 数据库端到端测试。

实现依据：[Strapi 5 custom routes](https://docs-v5.strapi.io/cms/backend-customization/routes)、[database transactions](https://docs-v5.strapi.io/cms/database-transactions)、[Document Service](https://docs.strapi.io/cms/api/content-api)。

## 验证

```powershell
node --test tests/finance-domain.test.mjs tests/finance-api.test.cjs
npm run build
```

自动测试覆盖金额精度、边界日期、A 未知、B/C 应收、付款分期、历史补录、冲销上限、状态计算、鉴权、不可修改记录，以及控制器的重复请求 / 住户隔离。控制器测试使用内存适配器，不能替代真实 Strapi 数据库验收。
