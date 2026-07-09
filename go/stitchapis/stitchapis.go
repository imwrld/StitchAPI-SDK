// Package stitchapis is the official Go SDK for StitchAPIs — a 1:1 client for
// every solver endpoint (PerimeterX, hCaptcha, Shape/F5, reCAPTCHA v3, DataDome,
// Incapsula, Amazon metadata1).
//
//	client := stitchapis.New("hk_your_key")
//	res, err := client.PXCookie(map[string]any{"site": "example.com", "proxy": "host:port:user:pass"})
//	if err != nil { log.Fatal(err) }
//	fmt.Println(res["cookie"])
package stitchapis

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

const DefaultBaseURL = "https://api.stitchapis.io"

// Result is the decoded JSON body of any successful solver response.
type Result map[string]any

// APIError is returned when the API responds with a non-2xx status or success:false.
type APIError struct {
	Message string
	Status  int
	Body    Result
}

func (e *APIError) Error() string { return fmt.Sprintf("stitchapis: %s (status %d)", e.Message, e.Status) }

// Client is a StitchAPIs API client. Safe for concurrent use.
type Client struct {
	APIKey     string
	BaseURL    string
	HTTPClient *http.Client
}

// Option configures a Client.
type Option func(*Client)

// WithBaseURL overrides the API base URL.
func WithBaseURL(u string) Option { return func(c *Client) { c.BaseURL = strings.TrimRight(u, "/") } }

// WithHTTPClient supplies a custom *http.Client (e.g. custom timeout/transport).
func WithHTTPClient(h *http.Client) Option { return func(c *Client) { c.HTTPClient = h } }

// New creates a Client with the given API key.
func New(apiKey string, opts ...Option) *Client {
	c := &Client{
		APIKey:     apiKey,
		BaseURL:    DefaultBaseURL,
		HTTPClient: &http.Client{Timeout: 120 * time.Second},
	}
	for _, o := range opts {
		o(c)
	}
	return c
}

// post sends a JSON POST and decodes the result, mapping errors to *APIError.
func (c *Client) post(ctx context.Context, path string, body any) (Result, error) {
	if body == nil {
		body = map[string]any{}
	}
	buf, err := json.Marshal(body)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.BaseURL+path, bytes.NewReader(buf))
	if err != nil {
		return nil, err
	}
	req.Header.Set("content-type", "application/json")
	req.Header.Set("x-api-key", c.APIKey)

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	raw, _ := io.ReadAll(resp.Body)
	var data Result
	if len(raw) > 0 {
		_ = json.Unmarshal(raw, &data)
	}
	success, _ := data["success"].(bool)
	if resp.StatusCode >= 400 || (data != nil && !success) {
		msg, _ := data["error"].(string)
		if msg == "" {
			msg = fmt.Sprintf("HTTP %d", resp.StatusCode)
		}
		return nil, &APIError{Message: msg, Status: resp.StatusCode, Body: data}
	}
	return data, nil
}

// Params is a convenience alias for a request body map.
type Params = map[string]any

// ── PerimeterX cookie (regular _px3/_px2) ────────────────────────────────────
// POST /web/cookie/init
//
//	in:  { site | pageUrl, ua?, proxy?, region?, _pxhd? }
//	out: { cookie, cts, vid, headers, px2?, pxhd?, pxde? }
func (c *Client) PXCookie(in Params, ctx ...context.Context) (Result, error) {
	return c.post(pick(ctx), "/web/cookie/init", in)
}

// ── PerimeterX hold-captcha (BYOC — forward the block, we solve) ─────────
// POST /web/cookie/hc
//
//	in:  { site, proxy, triggerUrl|url, blockResponse, region? } (some sites also take uuid/vid or userAgent)
//	out: { px3?|px2?, pxvid?, pxde?, pxhd?, validated? }
func (c *Client) PXHoldCookie(in Params, ctx ...context.Context) (Result, error) {
	return c.post(pick(ctx), "/web/cookie/hc", in)
}

// ── PerimeterX px3 generation ────────────────────────────────────────────
// POST /web/px/collect
//
//	in:  { proxy (required), userAgent?, uuid?, vid?, sessionId?, region? }
//	out: { px3, pxde, uuid, vid, sessionId }
func (c *Client) PXCollect(in Params, ctx ...context.Context) (Result, error) {
	return c.post(pick(ctx), "/web/px/collect", in)
}

// ── hCaptcha ─────────────────────────────────────────────────────────────────
// POST /web/hcaptcha/solve
//
//	in:  { sitekey, domain, proxy?, rqdata?, href?, useragent? }
//	out: { token, expiration }
func (c *Client) Hcaptcha(in Params, ctx ...context.Context) (Result, error) {
	return c.post(pick(ctx), "/web/hcaptcha/solve", in)
}

// ── Shape / F5 ───────────────────────────────────────────────────────────────
// POST /web/shape
//
//	in:  { triggerUrl, proxy (recommended; required for sites that block datacenter IPs), requestBody?, visitorId?, tealeafId? }
//	out: { headers, device, requestBody }
func (c *Client) Shape(in Params, ctx ...context.Context) (Result, error) {
	return c.post(pick(ctx), "/web/shape", in)
}

// ── reCAPTCHA v3 (and v3 Enterprise) ─────────────────────────────────────────
// POST /web/recaptcha/v3
//
//	task: { type?, websiteURL, websiteKey, proxy?, pageAction?, enterprisePayload?, isSession?, apiDomain? }
//	out:  { solution: { gRecaptchaResponse }, token, action, provider }
func (c *Client) RecaptchaV3(task Params, ctx ...context.Context) (Result, error) {
	return c.post(pick(ctx), "/web/recaptcha/v3", Params{"task": task})
}

// ── DataDome ─────────────────────────────────────────────────────────────────
// POST /web/datadome/interstitial — in: { userAgent, deviceLink, html, ip, acceptLanguage }
func (c *Client) DatadomeInterstitial(in Params, ctx ...context.Context) (Result, error) {
	return c.post(pick(ctx), "/web/datadome/interstitial", in)
}

// POST /web/datadome/slider — in: { userAgent, deviceLink, html, puzzle, piece, parentUrl, ip, acceptLanguage }
func (c *Client) DatadomeSlider(in Params, ctx ...context.Context) (Result, error) {
	return c.post(pick(ctx), "/web/datadome/slider", in)
}

// POST /web/datadome/tags — in: { userAgent, ddk, referer, type("ch"|"le"), ip, acceptLanguage, version, cid? }
func (c *Client) DatadomeTags(in Params, ctx ...context.Context) (Result, error) {
	return c.post(pick(ctx), "/web/datadome/tags", in)
}

// ── Incapsula / Imperva ──────────────────────────────────────────────────────
// POST /web/incapsula/reese84 — in: { userAgent, pageUrl, script, scriptUrl, acceptLanguage, ip, pow?, cookies?, proxy? }
func (c *Client) IncapsulaReese84(in Params, ctx ...context.Context) (Result, error) {
	return c.post(pick(ctx), "/web/incapsula/reese84", in)
}

// POST /web/incapsula/reese84/renew — in: { token }
func (c *Client) IncapsulaReese84Renew(token string, ctx ...context.Context) (Result, error) {
	return c.post(pick(ctx), "/web/incapsula/reese84/renew", Params{"token": token})
}

// POST /web/incapsula/utmvc — in: { userAgent, script, sessionIds, ip?, acceptLanguage? }
func (c *Client) IncapsulaUtmvc(in Params, ctx ...context.Context) (Result, error) {
	return c.post(pick(ctx), "/web/incapsula/utmvc", in)
}

// ── Amazon metadata1 ─────────────────────────────────────────────────────────
// POST /web/metadata1 — in: { email, userAgent, passwordLength, referer?, location? } out: { email, password }
func (c *Client) Metadata1(in Params, ctx ...context.Context) (Result, error) {
	return c.post(pick(ctx), "/web/metadata1", in)
}

// pick returns the supplied context or context.Background().
func pick(ctx []context.Context) context.Context {
	if len(ctx) > 0 && ctx[0] != nil {
		return ctx[0]
	}
	return context.Background()
}
