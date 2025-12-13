const headers = $request.headers;
const auth = headers["Authorization"] || headers["authorization"];
const ua = headers["User-Agent"] || headers["user-agent"];

const options = {
  url: "https://api.revenuecat.com/v1/product_entitlement_mapping",
  headers: {
    "Authorization": auth,
    "X-Platform": "iOS",
    "User-Agent": ua
  }
};

$httpClient.get(options, (error, response, data) => {
  if (error || !data) {
    $done({});
    return;
  }

  const mapping = JSON.parse(data).product_entitlement_mapping;
  
  const nowObj = new Date();
  const now = nowObj.toISOString();
  const nowMs = nowObj.getTime();

  const pastObj = new Date(nowObj);
  pastObj.setFullYear(pastObj.getFullYear() - 1);
  const pastDate = pastObj.toISOString();

  let bestProduct = null;
  let durationType = "annual";
  const allEntitlements = new Set();

  for (const [pid, info] of Object.entries(mapping)) {
    info.entitlements.forEach(e => allEntitlements.add(e));
    const lowerPid = pid.toLowerCase();

    if (lowerPid.includes("lifetime") || lowerPid.includes("forever") || lowerPid.includes("unlimited")) {
      bestProduct = pid;
      durationType = "lifetime";
      break; 
    }
  }

  if (!bestProduct) {
    for (const [pid, info] of Object.entries(mapping)) {
      const lowerPid = pid.toLowerCase();
      if (lowerPid.includes("year") || lowerPid.includes("annual")) {
        bestProduct = pid;
        durationType = "annual";
        break;
      }
    }
  }

  if (!bestProduct) {
    for (const [pid, info] of Object.entries(mapping)) {
      const lowerPid = pid.toLowerCase();
      if (lowerPid.includes("month")) {
        bestProduct = pid;
        durationType = "monthly";
        break;
      }
    }
  }

  if (!bestProduct) {
    bestProduct = Object.keys(mapping)[0];
  }

  let expireDate = null;
  const expireObj = new Date(nowObj);

  switch (durationType) {
    case "lifetime":
      expireDate = null;
      break;
    case "annual":
      expireObj.setFullYear(expireObj.getFullYear() + 1);
      expireDate = expireObj.toISOString();
      break;
    case "monthly":
      expireObj.setMonth(expireObj.getMonth() + 1);
      expireDate = expireObj.toISOString();
      break;
    default: 
      expireObj.setFullYear(expireObj.getFullYear() + 1);
      expireDate = expireObj.toISOString();
      break;
  }

  const body = {
    "request_date_ms": nowMs,
    "request_date": now,
    "subscriber": {
      "entitlement": {},
      "first_seen": pastDate,
      "original_application_version": "1.0",
      "last_seen": now,
      "other_purchases": {},
      "management_url": "https://apps.apple.com/account/subscriptions",
      "subscriptions": {},
      "entitlements": {},
      "original_purchase_date": pastDate,
      "original_app_user_id": "app_user_id",
      "non_subscriptions": {}
    }
  };

  const subInfo = {
    "original_purchase_date": pastDate,
    "purchase_date": now,
    "is_sandbox": false,
    "ownership_type": "PURCHASED",
    "store": "app_store",
    "period_type": "normal"
  };

  if (expireDate) {
    subInfo["expires_date"] = expireDate;
  }

  body.subscriber.subscriptions[bestProduct] = subInfo;

  for (const ent of allEntitlements) {
    body.subscriber.entitlements[ent] = {
      ...subInfo,
      "product_identifier": bestProduct
    };
  }

  $done({ body: JSON.stringify(body) });
});
