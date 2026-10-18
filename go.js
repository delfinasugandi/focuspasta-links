// Logs the visit to PostHog, then forwards to the App Store campaign link.
// Each page sets its campaign (and optionally its event name) on the script tag:
//   <script src="/go.js" data-campaign="cceb-2026"></script>
(() => {
  const PT = "127176196";
  const APP_ID = "6505106497";
  const POSTHOG_KEY = "phc_z6J8ZL9UEfx8isGEo4J5mPQ2csSpHF5Fi4eReETJMtSp";

  const tag = document.currentScript.dataset;
  // Fall back to ?c=… so ad-hoc links work without a folder.
  const raw = tag.campaign || new URLSearchParams(location.search).get("c") || "unknown";
  // Limited to what Apple's ct accepts.
  const campaign = raw.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 40) || "unknown";
  const event = tag.event || "qr_scanned";

  const store = `https://apps.apple.com/app/apple-store/id${APP_ID}?pt=${PT}&ct=${encodeURIComponent(campaign)}&mt=8`;

  let gone = false;
  const go = () => { if (!gone) { gone = true; location.replace(store); } };

  fetch("https://us.i.posthog.com/capture/", {
    method: "POST",
    keepalive: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: POSTHOG_KEY,
      event,
      distinct_id: crypto.randomUUID(),
      properties: {
        campaign,
        $process_person_profile: false,
        $current_url: location.href,
        $referrer: document.referrer
      }
    })
  }).finally(go);

  // Never strand someone if PostHog is slow or blocked.
  setTimeout(go, 1000);
})();
