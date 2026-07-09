<div align="center">

# StitchAPIs SDK

**Official client libraries for the [StitchAPIs](https://stitchapis.io/) solver API — one clean interface for every anti-bot challenge.**

Solve PerimeterX, Shape / F5, hCaptcha, reCAPTCHA v3, DataDome, Incapsula and more — from **JavaScript / TypeScript**, **Python**, or **Go**.

![JavaScript](https://img.shields.io/badge/JavaScript-Node%2018%2B-f7df1e?logo=javascript&logoColor=black)
![Python](https://img.shields.io/badge/Python-3.8%2B-3776ab?logo=python&logoColor=white)
![Go](https://img.shields.io/badge/Go-1.20%2B-00add8?logo=go&logoColor=white)
![API](https://img.shields.io/badge/API-api.stitchapis.io-6c5ce7)

</div>

---

## ✨ Why this SDK

- **One method per solver.** Identical surface across all three languages — same fields, same responses.
- **Zero heavy dependencies.** JS uses the built-in `fetch`, Go uses the standard library, Python uses `requests` if present and falls back to `urllib`.
- **Typed where it counts.** Full TypeScript declarations and typed Python/Go signatures for the common solvers; every method also forwards arbitrary fields, so nothing is ever in your way.
- **Consistent auth & errors.** Your key rides in `x-api-key` automatically; failures raise/return a structured error with the HTTP status and body.

---

## 📚 Solvers at a glance

| Solver | Endpoint | JavaScript | Python | Go |
|---|---|---|---|---|
| PerimeterX cookie | `POST /web/cookie/init` | `pxCookie` | `px_cookie` | `PXCookie` |
| PerimeterX hold-captcha | `POST /web/cookie/hc` | `pxHoldCookie` | `px_hold_cookie` | `PXHoldCookie` |
| PerimeterX collect | `POST /web/px/collect` | `pxCollect` | `px_collect` | `PXCollect` |
| hCaptcha | `POST /web/hcaptcha/solve` | `hcaptcha` | `hcaptcha` | `Hcaptcha` |
| Shape / F5 | `POST /web/shape` | `shape` | `shape` | `Shape` |
| reCAPTCHA v3 | `POST /web/recaptcha/v3` | `recaptchaV3` | `recaptcha_v3` | `RecaptchaV3` |
| DataDome interstitial | `POST /web/datadome/interstitial` | `datadomeInterstitial` | `datadome_interstitial` | `DatadomeInterstitial` |
| DataDome slider | `POST /web/datadome/slider` | `datadomeSlider` | `datadome_slider` | `DatadomeSlider` |
| DataDome tags | `POST /web/datadome/tags` | `datadomeTags` | `datadome_tags` | `DatadomeTags` |
| Incapsula Reese84 | `POST /web/incapsula/reese84` | `incapsulaReese84` | `incapsula_reese84` | `IncapsulaReese84` |
| Incapsula Reese84 renew | `POST /web/incapsula/reese84/renew` | `incapsulaReese84Renew` | `incapsula_reese84_renew` | `IncapsulaReese84Renew` |
| Incapsula UTMVC | `POST /web/incapsula/utmvc` | `incapsulaUtmvc` | `incapsula_utmvc` | `IncapsulaUtmvc` |
| Amazon metadata1 | `POST /web/metadata1` | `metadata1` | `metadata1` | `Metadata1` |

- **Base URL:** `https://api.stitchapis.io`
- **Auth:** every request carries your key in the `x-api-key` header (the SDK sets this for you).
- **Requests:** all `POST` with a JSON body; a success returns a JSON object with `success: true`.

---

## 📦 Install

**JavaScript / TypeScript**
```bash
npm install stitchapis
```

**Python**
```bash
pip install stitchapis
```

**Go**
```bash
go get github.com/imwrld/StitchAPI-SDK/stitchapis
```
> Using your own fork? Point the import at your module path — the layout is `<module>/stitchapis`.

---

## 🚀 Quick start

<table>
<tr><th>JavaScript / TypeScript</th></tr>
<tr><td>

```js
const { StitchAPIs } = require("stitchapis");

const client = new StitchAPIs("hk_your_key");

const res = await client.pxCookie({
  site: "example.com",
  proxy: "host:port:user:pass",
  region: "us",
});
console.log(res.cookie); // the _px3 cookie
```

</td></tr>
<tr><th>Python</th></tr>
<tr><td>

```python
from stitchapis import StitchAPIs

client = StitchAPIs("hk_your_key")

res = client.px_cookie(
    site="example.com",
    proxy="host:port:user:pass",
    region="us",
)
print(res["cookie"])  # the _px3 cookie
```

</td></tr>
<tr><th>Go</th></tr>
<tr><td>

```go
package main

import (
    "fmt"
    "log"

    "github.com/imwrld/StitchAPI-SDK/stitchapis"
)

func main() {
    client := stitchapis.New("hk_your_key")

    res, err := client.PXCookie(stitchapis.Params{
        "site":   "example.com",
        "proxy":  "host:port:user:pass",
        "region": "us",
    })
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println(res["cookie"]) // the _px3 cookie
}
```

</td></tr>
</table>

### Configuration

Every client accepts an optional base URL and timeout.

```js
const client = new StitchAPIs("hk_your_key", { baseUrl: "https://api.stitchapis.io", timeoutMs: 60000 });
```
```python
client = StitchAPIs("hk_your_key", base_url="https://api.stitchapis.io", timeout=60)
```
```go
client := stitchapis.New("hk_your_key", stitchapis.WithBaseURL("https://api.stitchapis.io"))
```

---

## 🌍 Regions (PerimeterX)

The PerimeterX solvers accept an optional **`region`** — the two-letter region of your proxy's exit IP. It keeps the generated payload's timezone and language coherent with that IP. It is auto-detected from the proxy host when omitted, and defaults to `us`.

`us` · `ca` · `mx` · `br` · `gb` · `ie` · `fr` · `de` · `es` · `it` · `nl` · `be` · `ch` · `at` · `pl` · `se` · `pt` · `au` · `nz` · `jp` · `in` · `sg`

> Match the region to your proxy — e.g. a French proxy → `region: "fr"`.

---

## 📖 Reference

Each solver lists its fields (**required** in bold) and a ready-to-run example in all three languages.

---

### 🍪 PerimeterX cookie — `pxCookie`

Returns a high-trust `_px3` cookie for a protected page. The solve runs through your proxy, so the cookie's trust follows that IP.

| Field | Type | Notes |
|---|---|---|
| **`site`** | string | Friendly name or host of the protected site (or use `pageUrl`). |
| **`proxy`** | string | `host:port:user:pass` or `user:pass@host:port`. |
| `pageUrl` | string | Full page URL, as an alternative to `site`. |
| `ua` | string | User-Agent. |
| `region` | string | Two-letter exit-IP region (see [Regions](#-regions-perimeterx)). |
| `_pxhd` | string | Existing `_pxhd` cookie, if you have one. |

**Returns:** `cookie` (the `_px3`), plus `cts`, `vid`, `px2`, `pxhd`, `pxde`, `headers`.

<details><summary><b>Example</b></summary>

```js
const res = await client.pxCookie({ site: "example.com", proxy: "host:port:user:pass", region: "us" });
console.log(res.cookie);
```
```python
res = client.px_cookie(site="example.com", proxy="host:port:user:pass", region="us")
print(res["cookie"])
```
```go
res, err := client.PXCookie(stitchapis.Params{"site": "example.com", "proxy": "host:port:user:pass", "region": "us"})
```
</details>

---

### 🛑 PerimeterX hold-captcha — `pxHoldCookie`

For sites that serve a press-and-hold block. **Bring your own challenge:** forward the block JSON your client received and we solve it, returning a validated high-trust cookie.

| Field | Type | Notes |
|---|---|---|
| **`site`** | string | The protected site name. |
| **`proxy`** | string | The solve runs through this — trust follows the IP. |
| **`blockResponse`** | string \| object | The full block JSON your client received (aliases: `blockJson`, `block`). |
| `triggerUrl` | string | The page you were on when the block appeared (alias: `url`). |
| `userAgent` | string | User-Agent; defaults to a current desktop UA. |
| `uuid`, `vid` | string | Session identity from the block, when applicable. |
| `region` | string | Two-letter exit-IP region (see [Regions](#-regions-perimeterx)). |

**Returns:** `px3` or `px2`, plus `pxvid`, `pxde`, `pxhd`, `validated`.

<details><summary><b>Example</b></summary>

```js
const res = await client.pxHoldCookie({
  site: "example.com",
  proxy: "host:port:user:pass",
  blockResponse: blockJson,   // the block your browser received
  region: "us",
});
console.log(res.px3, res.validated);
```
```python
res = client.px_hold_cookie(
    site="example.com",
    proxy="host:port:user:pass",
    blockResponse=block_json,
    region="us",
)
print(res.get("px3"), res.get("validated"))
```
```go
res, err := client.PXHoldCookie(stitchapis.Params{
    "site":          "example.com",
    "proxy":         "host:port:user:pass",
    "blockResponse": blockJSON,
    "region":        "us",
})
```
</details>

---

### 🔁 PerimeterX collect — `pxCollect`

Generates a fresh, session-unique `_px3` (plus `pxde`) through your proxy.

| Field | Type | Notes |
|---|---|---|
| **`proxy`** | string | All traffic egresses through this. |
| `userAgent` | string | User-Agent. |
| `uuid`, `vid`, `sessionId` | string | Pin the session; fresh values are generated when omitted. |
| `region` | string | Two-letter exit-IP region (see [Regions](#-regions-perimeterx)). |

**Returns:** `px3`, `pxde`, `uuid`, `vid`, `sessionId`.

<details><summary><b>Example</b></summary>

```js
const res = await client.pxCollect({ proxy: "host:port:user:pass", region: "us" });
console.log(res.px3);
```
```python
res = client.px_collect(proxy="host:port:user:pass", region="us")
print(res["px3"])
```
```go
res, err := client.PXCollect(stitchapis.Params{"proxy": "host:port:user:pass", "region": "us"})
```
</details>

---

### 🧩 hCaptcha — `hcaptcha`

Returns a token you submit as `h-captcha-response` / `g-recaptcha-response`.

| Field | Type | Notes |
|---|---|---|
| **`sitekey`** | string | The site key. |
| **`domain`** | string | The host the widget runs on. |
| `proxy` | string | Score IP. |
| `rqdata` | string | Enterprise `rqdata`, when required. |
| `href` | string | Page URL. |
| `useragent` | string | User-Agent. |

**Returns:** `token`, `expiration`.

<details><summary><b>Example</b></summary>

```js
const res = await client.hcaptcha({ sitekey: "10000000-ffff-ffff-ffff-000000000001", domain: "example.com" });
console.log(res.token);
```
```python
res = client.hcaptcha(sitekey="10000000-ffff-ffff-ffff-000000000001", domain="example.com")
print(res["token"])
```
```go
res, err := client.Hcaptcha(stitchapis.Params{"sitekey": "10000000-ffff-ffff-ffff-000000000001", "domain": "example.com"})
```
</details>

---

### 🛡️ Shape / F5 — `shape`

Returns the request headers plus the finalized request body to send to the endpoint the header rides on, along with the `userAgent` the headers were computed under.

| Field | Type | Notes |
|---|---|---|
| **`triggerUrl`** | string | The endpoint the header rides on (selects the flow). |
| **`proxy`** | string | Recommended; required for sites that block datacenter IPs. |
| `requestBody` | string | The exact body of that request, if it has one. |
| `visitorId`, `tealeafId` | string | Pin a session-stable identity across calls in one flow. |

**Returns:** `headers`, `device`, `userAgent`, `requestBody`.

> The returned header **names** can rotate per session — read them from `headers` and send whatever keys come back. Use the returned `userAgent` as your request's User-Agent, and send `requestBody` verbatim.

<details><summary><b>Example</b></summary>

```js
const shape = await client.shape({
  triggerUrl: "https://example.com/signin",
  proxy: "host:port:user:pass",
  requestBody: '[{"email":"you@example.com","password":"..."}]',
});
// send shape.headers + shape.requestBody to triggerUrl, with User-Agent = shape.userAgent
console.log(Object.keys(shape.headers));
```
```python
shape = client.shape(
    trigger_url="https://example.com/signin",
    proxy="host:port:user:pass",
    requestBody='[{"email":"you@example.com","password":"..."}]',
)
print(list(shape["headers"].keys()))
```
```go
shape, err := client.Shape(stitchapis.Params{
    "triggerUrl":  "https://example.com/signin",
    "proxy":       "host:port:user:pass",
    "requestBody": `[{"email":"you@example.com","password":"..."}]`,
})
```
</details>

---

### 🤖 reCAPTCHA v3 — `recaptchaV3`

Returns a v3 (or v3 Enterprise) token.

| Field | Type | Notes |
|---|---|---|
| **`websiteURL`** | string | The page URL. |
| **`websiteKey`** | string | The site key. |
| `type` | string | `ReCaptchaV3Task`, `ReCaptchaV3TaskProxyLess`, `ReCaptchaV3EnterpriseTask`, or `ReCaptchaV3EnterpriseTaskProxyLess`. |
| `proxy` | string | Score IP — required for non-`ProxyLess` types. |
| `pageAction` | string | The action name. |
| `enterprisePayload` | object | Enterprise `s`/token payload. |
| `isSession`, `apiDomain` | bool / string | Advanced options. |

**Returns:** `solution.gRecaptchaResponse`, `token`, `action`, `provider`.

<details><summary><b>Example</b></summary>

```js
const res = await client.recaptchaV3({
  websiteURL: "https://example.com/login",
  websiteKey: "6Lc_site_key",
  pageAction: "login",
});
console.log(res.token);
```
```python
res = client.recaptcha_v3(
    website_url="https://example.com/login",
    website_key="6Lc_site_key",
    page_action="login",
)
print(res["token"])
```
```go
res, err := client.RecaptchaV3(stitchapis.Params{
    "websiteURL": "https://example.com/login",
    "websiteKey": "6Lc_site_key",
    "pageAction": "login",
})
```
</details>

---

### 🧱 DataDome interstitial — `datadomeInterstitial`

Returns the clearance payload for a DataDome interstitial challenge.

| Field | Type | Notes |
|---|---|---|
| **`userAgent`** | string | User-Agent. |
| **`deviceLink`** | string | The device-check URL from the challenge. |
| **`html`** | string | The challenge page HTML. |
| **`ip`** | string | Client IP (of your proxy). |
| **`acceptLanguage`** | string | Accept-Language header. |

**Returns:** `payload`, `contentType`, `headers`.

<details><summary><b>Example</b></summary>

```js
const res = await client.datadomeInterstitial({
  userAgent: "Mozilla/5.0 ...",
  deviceLink: "https://geo.captcha-delivery.com/...",
  html: "<html>...</html>",
  ip: "203.0.113.10",
  acceptLanguage: "en-US,en;q=0.9",
});
console.log(res.payload);
```
```python
res = client.datadome_interstitial(
    userAgent="Mozilla/5.0 ...",
    deviceLink="https://geo.captcha-delivery.com/...",
    html="<html>...</html>",
    ip="203.0.113.10",
    acceptLanguage="en-US,en;q=0.9",
)
print(res["payload"])
```
```go
res, err := client.DatadomeInterstitial(stitchapis.Params{
    "userAgent":      "Mozilla/5.0 ...",
    "deviceLink":     "https://geo.captcha-delivery.com/...",
    "html":           "<html>...</html>",
    "ip":             "203.0.113.10",
    "acceptLanguage": "en-US,en;q=0.9",
})
```
</details>

---

### 🧩 DataDome slider — `datadomeSlider`

Returns the clearance payload for a DataDome slider challenge.

| Field | Type | Notes |
|---|---|---|
| **`userAgent`** | string | User-Agent. |
| **`deviceLink`** | string | The device-check URL from the challenge. |
| **`html`** | string | The challenge page HTML. |
| **`puzzle`** | string | The puzzle image (URL or data). |
| **`piece`** | string | The slider-piece image. |
| **`parentUrl`** | string | The page that embedded the challenge. |
| **`ip`** | string | Client IP (of your proxy). |
| **`acceptLanguage`** | string | Accept-Language header. |

**Returns:** `payload`, `contentType`, `headers`.

<details><summary><b>Example</b></summary>

```js
const res = await client.datadomeSlider({
  userAgent: "Mozilla/5.0 ...",
  deviceLink: "https://geo.captcha-delivery.com/...",
  html: "<html>...</html>",
  puzzle: "https://.../puzzle.jpg",
  piece: "https://.../piece.frag.png",
  parentUrl: "https://example.com/",
  ip: "203.0.113.10",
  acceptLanguage: "en-US,en;q=0.9",
});
```
```python
res = client.datadome_slider(
    userAgent="Mozilla/5.0 ...",
    deviceLink="https://geo.captcha-delivery.com/...",
    html="<html>...</html>",
    puzzle="https://.../puzzle.jpg",
    piece="https://.../piece.frag.png",
    parentUrl="https://example.com/",
    ip="203.0.113.10",
    acceptLanguage="en-US,en;q=0.9",
)
```
```go
res, err := client.DatadomeSlider(stitchapis.Params{
    "userAgent":      "Mozilla/5.0 ...",
    "deviceLink":     "https://geo.captcha-delivery.com/...",
    "html":           "<html>...</html>",
    "puzzle":         "https://.../puzzle.jpg",
    "piece":          "https://.../piece.frag.png",
    "parentUrl":      "https://example.com/",
    "ip":             "203.0.113.10",
    "acceptLanguage": "en-US,en;q=0.9",
})
```
</details>

---

### 🏷️ DataDome tags — `datadomeTags`

Returns the DataDome tags-init payload.

| Field | Type | Notes |
|---|---|---|
| **`userAgent`** | string | User-Agent. |
| **`ddk`** | string | The DataDome client key. |
| **`referer`** | string | The page URL. |
| **`type`** | string | `ch` or `le`. |
| **`ip`** | string | Client IP (of your proxy). |
| **`acceptLanguage`** | string | Accept-Language header. |
| **`version`** | string | Tags version. |
| `cid` | string | Existing DataDome cookie id, if you have one. |

**Returns:** `payload`, `contentType`, `headers`.

<details><summary><b>Example</b></summary>

```js
const res = await client.datadomeTags({
  userAgent: "Mozilla/5.0 ...",
  ddk: "ABCDEF0123456789",
  referer: "https://example.com/",
  type: "ch",
  ip: "203.0.113.10",
  acceptLanguage: "en-US,en;q=0.9",
  version: "4.0.1",
});
```
```python
res = client.datadome_tags(
    userAgent="Mozilla/5.0 ...",
    ddk="ABCDEF0123456789",
    referer="https://example.com/",
    type="ch",
    ip="203.0.113.10",
    acceptLanguage="en-US,en;q=0.9",
    version="4.0.1",
)
```
```go
res, err := client.DatadomeTags(stitchapis.Params{
    "userAgent":      "Mozilla/5.0 ...",
    "ddk":            "ABCDEF0123456789",
    "referer":        "https://example.com/",
    "type":           "ch",
    "ip":             "203.0.113.10",
    "acceptLanguage": "en-US,en;q=0.9",
    "version":        "4.0.1",
})
```
</details>

---

### 🌐 Incapsula Reese84 — `incapsulaReese84`

Returns an Incapsula / Imperva Reese84 sensor payload.

| Field | Type | Notes |
|---|---|---|
| **`userAgent`** | string | User-Agent. |
| **`pageUrl`** | string | The protected page URL. |
| **`script`** | string | The Reese84 sensor script text. |
| **`scriptUrl`** | string | The sensor script URL. |
| **`acceptLanguage`** | string | Accept-Language header. |
| **`ip`** | string | Client IP (of your proxy). |
| `pow` | string | Proof-of-work input, when present. |
| `cookies` | object | Existing cookies, if any. |
| `proxy` | string | Proxy, when applicable. |

**Returns:** `payload`, `swhanedl`, `contentType`, `headers`.

<details><summary><b>Example</b></summary>

```js
const res = await client.incapsulaReese84({
  userAgent: "Mozilla/5.0 ...",
  pageUrl: "https://example.com/",
  script: "<sensor script text>",
  scriptUrl: "https://example.com/_Incapsula_Resource?...",
  acceptLanguage: "en-US,en;q=0.9",
  ip: "203.0.113.10",
});
console.log(res.payload);
```
```python
res = client.incapsula_reese84(
    userAgent="Mozilla/5.0 ...",
    pageUrl="https://example.com/",
    script="<sensor script text>",
    scriptUrl="https://example.com/_Incapsula_Resource?...",
    acceptLanguage="en-US,en;q=0.9",
    ip="203.0.113.10",
)
```
```go
res, err := client.IncapsulaReese84(stitchapis.Params{
    "userAgent":      "Mozilla/5.0 ...",
    "pageUrl":        "https://example.com/",
    "script":         "<sensor script text>",
    "scriptUrl":      "https://example.com/_Incapsula_Resource?...",
    "acceptLanguage": "en-US,en;q=0.9",
    "ip":             "203.0.113.10",
})
```
</details>

---

### ♻️ Incapsula Reese84 renew — `incapsulaReese84Renew`

Refreshes an existing Reese84 token.

| Field | Type | Notes |
|---|---|---|
| **`token`** | string | The current Reese84 token to renew. |

**Returns:** `payload`, `contentType`, `headers`.

<details><summary><b>Example</b></summary>

```js
const res = await client.incapsulaReese84Renew("current_reese84_token");
```
```python
res = client.incapsula_reese84_renew("current_reese84_token")
```
```go
res, err := client.IncapsulaReese84Renew("current_reese84_token")
```
</details>

---

### 🍥 Incapsula UTMVC — `incapsulaUtmvc`

Returns an Incapsula `___utmvc` sensor payload.

| Field | Type | Notes |
|---|---|---|
| **`userAgent`** | string | User-Agent. |
| **`script`** | string | The UTMVC script text. |
| **`sessionIds`** | string[] | The session ids from the page. |
| `ip` | string | Client IP (of your proxy). |
| `acceptLanguage` | string | Accept-Language header. |

**Returns:** `payload`, `swhanedl`, `contentType`, `headers`.

<details><summary><b>Example</b></summary>

```js
const res = await client.incapsulaUtmvc({
  userAgent: "Mozilla/5.0 ...",
  script: "<utmvc script text>",
  sessionIds: ["session-id-1", "session-id-2"],
});
```
```python
res = client.incapsula_utmvc(
    user_agent="Mozilla/5.0 ...",
    script="<utmvc script text>",
    session_ids=["session-id-1", "session-id-2"],
)
```
```go
res, err := client.IncapsulaUtmvc(stitchapis.Params{
    "userAgent":  "Mozilla/5.0 ...",
    "script":     "<utmvc script text>",
    "sessionIds": []string{"session-id-1", "session-id-2"},
})
```
</details>

---

### 📦 Amazon metadata1 — `metadata1`

Returns the Amazon `metadata1` email + password payloads.

| Field | Type | Notes |
|---|---|---|
| **`email`** | string | The account email. |
| **`userAgent`** | string | User-Agent. |
| **`passwordLength`** | number | Length of the password being submitted. |
| `referer` | string | Referer, when applicable. |
| `location` | string | Location, when applicable. |

**Returns:** `email`, `password` (the two `metadata1` values).

<details><summary><b>Example</b></summary>

```js
const res = await client.metadata1({ email: "you@example.com", userAgent: "Mozilla/5.0 ...", passwordLength: 12 });
console.log(res.email, res.password);
```
```python
res = client.metadata1(email="you@example.com", user_agent="Mozilla/5.0 ...", password_length=12)
print(res["email"], res["password"])
```
```go
res, err := client.Metadata1(stitchapis.Params{"email": "you@example.com", "userAgent": "Mozilla/5.0 ...", "passwordLength": 12})
```
</details>

---

## ⚠️ Errors

On a non-2xx status or `success: false`, the SDK surfaces a structured error carrying the HTTP status and response body. Messages are intentionally generic — check your inputs or retry, often on a cleaner proxy / IP.

```js
try {
  const res = await client.pxCookie({ site: "example.com", proxy: "host:port:user:pass" });
} catch (err) {
  console.error(err.status, err.body); // StitchAPIsError
}
```
```python
from stitchapis import StitchAPIsError
try:
    res = client.px_cookie(site="example.com", proxy="host:port:user:pass")
except StitchAPIsError as err:
    print(err.status, err.body)
```
```go
res, err := client.PXCookie(stitchapis.Params{"site": "example.com", "proxy": "host:port:user:pass"})
if err != nil {
    if apiErr, ok := err.(*stitchapis.APIError); ok {
        fmt.Println(apiErr.Status, apiErr.Body)
    }
}
```

---

<div align="center">

## 🔑 Want access?

Get an API key at **[stitchapis.io](https://stitchapis.io/)** — then **join the Discord** and **open a ticket** to get set up.

<sub>Made with care by the StitchAPIs team.</sub>

</div>
# StitchAPI-SDK
