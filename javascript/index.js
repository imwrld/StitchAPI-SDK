// StitchAPIs JavaScript/TypeScript SDK — 1:1 client for every solver endpoint.
//
//   const { StitchAPIs } = require("stitchapis");
//   const client = new StitchAPIs("hk_your_key");
//   const px = await client.pxCookie({ site: "example.com", proxy: "host:port:user:pass" });
//
// Works in Node 18+ (global fetch) and modern browsers. No dependencies.

const DEFAULT_BASE_URL = "https://api.stitchapis.io";

class StitchAPIsError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = "StitchAPIsError";
    this.status = status;
    this.body = body;
  }
}

class StitchAPIs {
  /**
   * @param {string} apiKey - your x-api-key
   * @param {{ baseUrl?: string, timeoutMs?: number, fetch?: Function }} [opts]
   */
  constructor(apiKey, opts = {}) {
    if (!apiKey) throw new Error("apiKey is required");
    this.apiKey = apiKey;
    this.baseUrl = (opts.baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.timeoutMs = opts.timeoutMs || 120000;
    this._fetch = opts.fetch || (typeof fetch !== "undefined" ? fetch.bind(globalThis) : null);
    if (!this._fetch) throw new Error("no fetch available — pass opts.fetch");
  }

  async _post(path, body) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    let resp;
    try {
      resp = await this._fetch(this.baseUrl + path, {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": this.apiKey },
        body: JSON.stringify(body || {}),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
    let data;
    const text = await resp.text();
    try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
    if (!resp.ok || data.success === false) {
      throw new StitchAPIsError(data.error || `HTTP ${resp.status}`, resp.status, data);
    }
    return data;
  }

  // ── PerimeterX cookie (regular _px3/_px2) ────────────────────────────────
  // POST /web/cookie/init
  //   input: { site | pageUrl, ua?, proxy?, _pxhd? }
  //   → { success, cookie, cts, vid, headers, px2?, pxhd?, pxde? }
  pxCookie(input) { return this._post("/web/cookie/init", input); }

  // ── PerimeterX hold-captcha (BYOC — forward the block, we solve) ─────────
  // POST /web/cookie/hc
  //   input: { site, proxy, ... } — forward the block your client received:
  //     hold sites: { site, proxy, triggerUrl|url, blockResponse }
  //     (some sites also accept uuid/vid or userAgent — see the API docs)
  //   → { success, px3?|px2?, pxvid?, pxde?, pxhd?, validated? }
  pxHoldCookie(input) { return this._post("/web/cookie/hc", input); }

  // ── PerimeterX px3 generation ────────────────────────────────────────────
  // POST /web/px/collect — fresh _px3 (+ pxde), minted through your proxy.
  //   input: { proxy (required), userAgent?, uuid?, vid?, sessionId? }
  //   → { success, px3, pxde, uuid, vid, sessionId }
  pxCollect(input) { return this._post("/web/px/collect", input); }

  // ── hCaptcha ─────────────────────────────────────────────────────────────
  // POST /web/hcaptcha/solve
  //   input: { sitekey, domain, proxy?, rqdata?, href?, useragent? }
  //   → { success, token, expiration }
  hcaptcha(input) { return this._post("/web/hcaptcha/solve", input); }

  // ── Shape / F5 ───────────────────────────────────────────────────────────
  // POST /web/shape
  //   input: { triggerUrl, requestBody?, loader?, loaderUrl?, seedUrl?, module?,
  //            siteUrl?, visitorId?, tealeafId?, noDeviceInfo? }
  //   → { success, headers, device, requestBody }
  shape(input) { return this._post("/web/shape", input); }

  // ── reCAPTCHA v3 (and v3 Enterprise) ─────────────────────────────────────
  // POST /web/recaptcha/v3
  //   input (task): { type?, websiteURL, websiteKey, proxy?, pageAction?,
  //                   enterprisePayload?, isSession?, apiDomain? }
  //   → { success, solution: { gRecaptchaResponse }, token, action, provider }
  recaptchaV3(task) { return this._post("/web/recaptcha/v3", { task }); }

  // ── DataDome ─────────────────────────────────────────────────────────────
  // POST /web/datadome/interstitial
  //   input: { userAgent, deviceLink, html, ip, acceptLanguage }
  //   → { success, payload, contentType, headers }
  datadomeInterstitial(input) { return this._post("/web/datadome/interstitial", input); }

  // POST /web/datadome/slider
  //   input: { userAgent, deviceLink, html, puzzle, piece, parentUrl, ip, acceptLanguage }
  //   → { success, payload, contentType, headers }
  datadomeSlider(input) { return this._post("/web/datadome/slider", input); }

  // POST /web/datadome/tags
  //   input: { userAgent, ddk, referer, type:"ch"|"le", ip, acceptLanguage, version, cid? }
  //   → { success, payload, contentType }
  datadomeTags(input) { return this._post("/web/datadome/tags", input); }

  // ── Incapsula / Imperva ──────────────────────────────────────────────────
  // POST /web/incapsula/reese84
  //   input: { userAgent, pageUrl, script, scriptUrl, acceptLanguage, ip, pow?, cookies?, proxy? }
  //   → { success, payload, contentType, headers }
  incapsulaReese84(input) { return this._post("/web/incapsula/reese84", input); }

  // POST /web/incapsula/reese84/renew
  //   input: { token }
  //   → { success, payload, contentType }
  incapsulaReese84Renew(token) { return this._post("/web/incapsula/reese84/renew", { token }); }

  // POST /web/incapsula/utmvc
  //   input: { userAgent, script, sessionIds:[...], ip?, acceptLanguage? }
  //   → { success, payload, swhanedl, contentType, headers }
  incapsulaUtmvc(input) { return this._post("/web/incapsula/utmvc", input); }

  // ── Amazon metadata1 ─────────────────────────────────────────────────────
  // POST /web/metadata1
  //   input: { email, userAgent, passwordLength, referer?, location? }
  //   → { success, email, password }
  metadata1(input) { return this._post("/web/metadata1", input); }
}

module.exports = { StitchAPIs, StitchAPIsError };
module.exports.default = StitchAPIs;
