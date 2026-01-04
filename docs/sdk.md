# OpenTrace SDK Documentation (v1.1)

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
ot.track('button_click', {
    button_name: 'hero_cta',
    page_section: 'header'
});
```

## 3. Automatic Event Tracking

The SDK automatically captures several events without additional configuration:

- **`page_view`**: Captured on every page load. Includes URL, referrer, screen resolution, and language.
- **`click`**: Captured when a user clicks on an `<a>`, `<button>`, or any element with the `data-ot-track` attribute.
  - *Captured fields:* ID, Text, Tag Name.
- **`form_submit`**: Captured when a user submits a form.
  - *Captured fields:* Form ID, Form Action.
- **`page_exit`**: Captured when the user leaves the page.
  - *Captured fields:* Duration (seconds), Scroll Depth (%).

## 4. Session & Click Identification

OpenTrace automatically manages session persistence and marketing identifiers:

- **Session ID**: Automatically generated and stored in `localStorage` as `_ot_sid`.
- **FBCLID / TTCLID**: If found in the URL, these are automatically stored in `localStorage` and sent with every subsequent event in the session, ensuring accurate CAPI attribution.

## 5. Conversion API (CAPI) Integration

To trigger a server-side conversion (e.g., to Facebook or TikTok), ensure you have:
1. Defined an **Event** in the OpenTrace Events page with a name matching your `eventName` (e.g., `purchase`).
2. Configured a **Conversion Action** for that event.

When you call `ot.track('purchase')` from the client, OpenTrace will automatically:
- Log the event in ClickHouse.
- Search for active CAPI actions for 'purchase'.
- Send the conversion server-to-server using the stored click IDs and user data.

## 6. Manual Tag Injection

Any tags you define in the **Tag Manager** for a specific resource are automatically fetched and executed by the SDK. This allows you to manage pixels, heatmaps, and other scripts without redeploying your website code.
