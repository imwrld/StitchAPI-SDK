// Type declarations for the StitchAPIs JavaScript SDK.

export interface StitchAPIsOptions {
  baseUrl?: string;
  timeoutMs?: number;
  fetch?: typeof fetch;
}

export class StitchAPIsError extends Error {
  status?: number;
  body?: any;
}

// ── Request/response shapes ────────────────────────────────────────────────

export interface PxCookieInput {
  site?: string;      // friendly name or host of the protected site
  pageUrl?: string;   // full URL alternative to `site`
  ua?: string;
  proxy?: string;     // host:port:user:pass or http://user:pass@host:port
  region?: string;    // two-letter exit-IP region (us, fr, gb, de…) → coherent tz + language; auto-detected from proxy when omitted
  _pxhd?: string;
}
export interface PxCookieResult {
  success: true;
  cookie: string;
  cts?: string;
  vid?: string;
  headers?: { secUa?: string; platform?: string; userAgent?: string };
  px2?: string;
  pxhd?: string;
  pxde?: string;
}

export interface PxHoldInput {
  site: string;               // "example.com" | "example" | "example" | ...
  proxy: string;
  userAgent?: string;
  triggerUrl?: string;
  url?: string;
  blockResponse?: unknown;    // full block JSON their browser received
  uuid?: string;
  vid?: string;
  region?: string;            // two-letter exit-IP region (us, fr, gb, de…) → coherent tz + language; auto-detected from proxy when omitted
  _pxhd?: string;
  [k: string]: unknown;
}
export interface PxHoldResult {
  success: true;
  px3?: string;
  px2?: string;
  pxvid?: string;
  pxde?: string;
  pxhd?: string;
  validated?: boolean;
}

export interface HcaptchaInput {
  sitekey: string;
  domain: string;
  proxy?: string;
  rqdata?: string;
  href?: string;
  useragent?: string;
}
export interface HcaptchaResult {
  success: true;
  token: string;
  expiration?: number;
}

export interface ShapeInput {
  triggerUrl: string;
  proxy?: string;       // recommended; required for Shape sites that block datacenter IPs
  requestBody?: string;
  visitorId?: string;   // pin a session-stable identity across calls in one flow
  tealeafId?: string;   // pin a session-stable identity across calls in one flow
  [k: string]: unknown; // forwards any additional fields verbatim
}
export interface ShapeResult {
  success: true;
  headers: Record<string, string>;
  device: any;
  requestBody: string;
}

export type RecaptchaV3TaskType =
  | "ReCaptchaV3Task"
  | "ReCaptchaV3TaskProxyLess"
  | "ReCaptchaV3EnterpriseTask"
  | "ReCaptchaV3EnterpriseTaskProxyLess";
export interface RecaptchaV3Task {
  type?: RecaptchaV3TaskType;
  websiteURL: string;
  websiteKey: string;
  proxy?: string;
  pageAction?: string;
  enterprisePayload?: Record<string, unknown>;
  isSession?: boolean;
  apiDomain?: string;
}
export interface RecaptchaV3Result {
  success: true;
  solution: { gRecaptchaResponse: string; "recaptcha-ca-t"?: string };
  token: string;
  action?: string;
  provider?: string;
}

export interface DatadomeInterstitialInput {
  userAgent: string; deviceLink: string; html: string; ip: string; acceptLanguage: string;
}
export interface DatadomeSliderInput {
  userAgent: string; deviceLink: string; html: string; puzzle: string; piece: string;
  parentUrl: string; ip: string; acceptLanguage: string;
}
export interface DatadomeTagsInput {
  userAgent: string; ddk: string; referer: string; type: "ch" | "le";
  ip: string; acceptLanguage: string; version: string; cid?: string;
}
export interface DatadomeResult {
  success: true; payload: string; contentType?: string; headers?: Record<string, string>;
}

export interface IncapsulaReese84Input {
  userAgent: string; pageUrl: string; script: string; scriptUrl: string;
  acceptLanguage: string; ip: string; pow?: string;
  cookies?: Record<string, string>; proxy?: unknown;
}
export interface IncapsulaUtmvcInput {
  userAgent: string; script: string; sessionIds: string[]; ip?: string; acceptLanguage?: string;
}
export interface IncapsulaResult {
  success: true; payload: string; swhanedl?: string; contentType?: string; headers?: Record<string, string>;
}

export interface Metadata1Input {
  email: string; userAgent: string; passwordLength: number; referer?: string; location?: string;
}
export interface Metadata1Result {
  success: true; email: string; password: string;
}

export interface PxCollectInput {
  proxy: string;        // required — collector traffic egresses through this
  userAgent?: string;
  region?: string;      // two-letter exit-IP region (us, fr, gb, de…) → coherent tz + language; auto-detected from proxy when omitted
  uuid?: string;
  vid?: string;
  sessionId?: string;
}
export interface PxCollectResult {
  success: true; px3: string; pxde?: string; uuid: string; vid: string; sessionId: string;
}

export class StitchAPIs {
  constructor(apiKey: string, opts?: StitchAPIsOptions);
  pxCookie(input: PxCookieInput): Promise<PxCookieResult>;
  pxHoldCookie(input: PxHoldInput): Promise<PxHoldResult>;
  pxCollect(input: PxCollectInput): Promise<PxCollectResult>;
  hcaptcha(input: HcaptchaInput): Promise<HcaptchaResult>;
  shape(input: ShapeInput): Promise<ShapeResult>;
  recaptchaV3(task: RecaptchaV3Task): Promise<RecaptchaV3Result>;
  datadomeInterstitial(input: DatadomeInterstitialInput): Promise<DatadomeResult>;
  datadomeSlider(input: DatadomeSliderInput): Promise<DatadomeResult>;
  datadomeTags(input: DatadomeTagsInput): Promise<DatadomeResult>;
  incapsulaReese84(input: IncapsulaReese84Input): Promise<IncapsulaResult>;
  incapsulaReese84Renew(token: string): Promise<IncapsulaResult>;
  incapsulaUtmvc(input: IncapsulaUtmvcInput): Promise<IncapsulaResult>;
  metadata1(input: Metadata1Input): Promise<Metadata1Result>;
}

export default StitchAPIs;
