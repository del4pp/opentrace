# OpenTrace SDK Documentation (v1.2.5)

The OpenTrace SDK (`t.js`) is a lightweight tracking script that enables real-time analytics and Conversion API (CAPI) integration for your websites.

## 1. Quick Start

To start tracking, add the following script tag to the `<head>` of your website:

```html
<script src="https://YOUR_DOMAIN/sdk/t.js?id=YOUR_RESOURCE_UID" async></script>
```

- Replace `YOUR_DOMAIN` with your OpenTrace instance URL.
- Replace `YOUR_RESOURCE_UID` with the UID from your Resources page (e.g., `OT-XXXXXXXX`).

## 2. Global Tracking Object

Once loaded, the SDK exposes a global `ot` object on the `window`.

### `ot.track(eventName, [metadata])`
Used to send custom events to OpenTrace.

**Example:**
```javascript
ot.track('purchase', {
    amount: 99.99,
    currency: 'USD',
    product_id: 'premium_plan'
});
```

## 3. Automatic Event Tracking

The SDK automatically captures several events without additional configuration:

- **`page_view`**: Captured on every page load. Includes URL, referrer, screen resolution, and language.
- **`click`**: Captured when a user clicks on an `<a>`, `<button>`, or any element with the `data-ot-track` attribute.
- **`form_submit`**: Captured when a user submits a form.
- **`page_exit`**: Captured when the user leaves the page.

## 4. Session & Click Identification

OpenTrace automatically manages session persistence and marketing identifiers:

- **Session ID**: Automatically generated and stored in `localStorage` as `_ot_sid`.
- **FBCLID / TTCLID**: If found in the URL, these are automatically stored in `localStorage` and sent with every subsequent event, ensuring accurate CAPI attribution.

## 5. Advanced Reporting Integration (New in v1.1.5)

Events sent via `ot.track` can now be analyzed using the **Advanced Reports** engine. 
- Use the **Revenue** metric in Reports to automatically aggregate the `amount` field from your events.
- All metadata sent in the `metadata` object is available for dimensional analysis and filtering.

## 6. Conversion API (CAPI) Integration

When you call `ot.track('purchase')`, OpenTrace automatically:
- Logs the event in ClickHouse.
- Triggers active CAPI actions (Facebook/TikTok) using the stored click IDs and user telemetry.

## 7. Manual Tag Injection

Any tags defined in the **Tag Manager** for a specific resource are automatically fetched and executed by the SDK.
