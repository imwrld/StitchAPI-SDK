"""StitchAPIs Python SDK — 1:1 client for every solver endpoint.

    from stitchapis import StitchAPIs

    client = StitchAPIs("hk_your_key")
    res = client.px_cookie(site="example.com", proxy="host:port:user:pass")
    print(res["cookie"])

Uses `requests` if available, otherwise falls back to urllib (no hard dependency).
"""

from typing import Any, Dict, List, Optional

__all__ = ["StitchAPIs", "StitchAPIsError"]
__version__ = "1.0.0"

DEFAULT_BASE_URL = "https://api.stitchapis.io"


class StitchAPIsError(Exception):
    def __init__(self, message: str, status: Optional[int] = None, body: Any = None):
        super().__init__(message)
        self.status = status
        self.body = body


class StitchAPIs:
    def __init__(
        self,
        api_key: str,
        base_url: str = DEFAULT_BASE_URL,
        timeout: float = 120.0,
    ):
        if not api_key:
            raise ValueError("api_key is required")
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

    # ── transport ──────────────────────────────────────────────────────────
    def _post(self, path: str, body: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        url = self.base_url + path
        payload = body or {}
        headers = {"content-type": "application/json", "x-api-key": self.api_key}
        data, status = self._request(url, payload, headers)
        if status is None or status >= 400 or (isinstance(data, dict) and data.get("success") is False):
            msg = data.get("error") if isinstance(data, dict) else f"HTTP {status}"
            raise StitchAPIsError(msg or f"HTTP {status}", status, data)
        return data

    def _request(self, url, payload, headers):
        try:
            import requests  # type: ignore

            r = requests.post(url, json=payload, headers=headers, timeout=self.timeout)
            try:
                data = r.json()
            except Exception:
                data = {"raw": r.text}
            return data, r.status_code
        except ImportError:
            import json
            import urllib.request
            import urllib.error

            body_bytes = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(url, data=body_bytes, headers=headers, method="POST")
            try:
                with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                    raw = resp.read().decode("utf-8")
                    return (json.loads(raw) if raw else {}), resp.status
            except urllib.error.HTTPError as e:
                raw = e.read().decode("utf-8")
                try:
                    return json.loads(raw), e.code
                except Exception:
                    return {"raw": raw}, e.code

    # ── PerimeterX cookie (regular _px3/_px2) ────────────────────────────────
    # POST /web/cookie/init -> {cookie, cts, vid, headers, px2?, pxhd?, pxde?}
    def px_cookie(
        self,
        site: Optional[str] = None,
        page_url: Optional[str] = None,
        ua: Optional[str] = None,
        proxy: Optional[str] = None,
        region: Optional[str] = None,
        pxhd: Optional[str] = None,
        **extra: Any,
    ) -> Dict[str, Any]:
        body: Dict[str, Any] = {}
        if site is not None:
            body["site"] = site
        if page_url is not None:
            body["pageUrl"] = page_url
        if ua is not None:
            body["ua"] = ua
        if proxy is not None:
            body["proxy"] = proxy
        # Two-letter exit-IP region (us, fr, gb, de…) → coherent tz + language;
        # auto-detected from the proxy host when omitted.
        if region is not None:
            body["region"] = region
        if pxhd is not None:
            body["_pxhd"] = pxhd
        body.update(extra)
        return self._post("/web/cookie/init", body)

    # ── PerimeterX hold-captcha (BYOC — forward the block, we solve)
    # POST /web/cookie/hc -> {px3?|px2?, pxvid?, pxde?, pxhd?, validated?}
    #   body: site, proxy, triggerUrl|url, blockResponse (some sites: uuid/vid or userAgent),
    #         region (optional two-letter exit-IP region → coherent tz + language)
    def px_hold_cookie(self, **body: Any) -> Dict[str, Any]:
        return self._post("/web/cookie/hc", body)

    # ── PerimeterX px3 generation
    # POST /web/px/collect -> {px3, pxde, uuid, vid, sessionId}
    #   body: proxy (required), userAgent/uuid/vid/sessionId/region (optional)
    def px_collect(self, **body: Any) -> Dict[str, Any]:
        return self._post("/web/px/collect", body)

    # ── hCaptcha ─────────────────────────────────────────────────────────────
    # POST /web/hcaptcha/solve -> {token, expiration}
    def hcaptcha(
        self,
        sitekey: str,
        domain: str,
        proxy: Optional[str] = None,
        rqdata: Optional[str] = None,
        href: Optional[str] = None,
        useragent: Optional[str] = None,
        **extra: Any,
    ) -> Dict[str, Any]:
        body: Dict[str, Any] = {"sitekey": sitekey, "domain": domain}
        if proxy is not None:
            body["proxy"] = proxy
        if rqdata is not None:
            body["rqdata"] = rqdata
        if href is not None:
            body["href"] = href
        if useragent is not None:
            body["useragent"] = useragent
        body.update(extra)
        return self._post("/web/hcaptcha/solve", body)

    # ── Shape / F5 ───────────────────────────────────────────────────────────
    # POST /web/shape -> {headers, device, requestBody}
    #   body: triggerUrl (required), proxy (recommended; required for sites that
    #         block datacenter IPs), requestBody (optional)
    def shape(self, trigger_url: str, **body: Any) -> Dict[str, Any]:
        body["triggerUrl"] = trigger_url
        return self._post("/web/shape", body)

    # ── reCAPTCHA v3 (and v3 Enterprise) ─────────────────────────────────────
    # POST /web/recaptcha/v3 -> {solution: {gRecaptchaResponse}, token, action, provider}
    def recaptcha_v3(
        self,
        website_url: str,
        website_key: str,
        task_type: Optional[str] = None,
        proxy: Optional[str] = None,
        page_action: Optional[str] = None,
        enterprise_payload: Optional[Dict[str, Any]] = None,
        is_session: Optional[bool] = None,
        api_domain: Optional[str] = None,
        **extra: Any,
    ) -> Dict[str, Any]:
        task: Dict[str, Any] = {"websiteURL": website_url, "websiteKey": website_key}
        if task_type is not None:
            task["type"] = task_type
        if proxy is not None:
            task["proxy"] = proxy
        if page_action is not None:
            task["pageAction"] = page_action
        if enterprise_payload is not None:
            task["enterprisePayload"] = enterprise_payload
        if is_session is not None:
            task["isSession"] = is_session
        if api_domain is not None:
            task["apiDomain"] = api_domain
        task.update(extra)
        return self._post("/web/recaptcha/v3", {"task": task})

    # ── DataDome ─────────────────────────────────────────────────────────────
    # POST /web/datadome/interstitial -> {payload, contentType, headers}
    def datadome_interstitial(self, **body: Any) -> Dict[str, Any]:
        return self._post("/web/datadome/interstitial", body)

    # POST /web/datadome/slider -> {payload, contentType, headers}
    def datadome_slider(self, **body: Any) -> Dict[str, Any]:
        return self._post("/web/datadome/slider", body)

    # POST /web/datadome/tags -> {payload, contentType}
    def datadome_tags(self, **body: Any) -> Dict[str, Any]:
        return self._post("/web/datadome/tags", body)

    # ── Incapsula / Imperva ──────────────────────────────────────────────────
    # POST /web/incapsula/reese84 -> {payload, contentType, headers}
    def incapsula_reese84(self, **body: Any) -> Dict[str, Any]:
        return self._post("/web/incapsula/reese84", body)

    # POST /web/incapsula/reese84/renew -> {payload, contentType}
    def incapsula_reese84_renew(self, token: str) -> Dict[str, Any]:
        return self._post("/web/incapsula/reese84/renew", {"token": token})

    # POST /web/incapsula/utmvc -> {payload, swhanedl, contentType, headers}
    def incapsula_utmvc(
        self,
        user_agent: str,
        script: str,
        session_ids: List[str],
        **extra: Any,
    ) -> Dict[str, Any]:
        body: Dict[str, Any] = {
            "userAgent": user_agent,
            "script": script,
            "sessionIds": session_ids,
        }
        body.update(extra)
        return self._post("/web/incapsula/utmvc", body)

    # ── Amazon metadata1 ─────────────────────────────────────────────────────
    # POST /web/metadata1 -> {email, password}
    def metadata1(
        self,
        email: str,
        user_agent: str,
        password_length: int,
        referer: Optional[str] = None,
        location: Optional[str] = None,
        **extra: Any,
    ) -> Dict[str, Any]:
        body: Dict[str, Any] = {
            "email": email,
            "userAgent": user_agent,
            "passwordLength": password_length,
        }
        if referer is not None:
            body["referer"] = referer
        if location is not None:
            body["location"] = location
        body.update(extra)
        return self._post("/web/metadata1", body)
