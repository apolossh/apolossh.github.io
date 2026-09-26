const request = typeof $request !== "undefined" ? $request : { headers: {}, url: "" };

const CONFIG = {
    REVENUECAT_API: "https://api.revenuecat.com/v1/product_entitlement_mapping",
    DEFAULT_VERSION: "1",
    DEFAULT_USER_ID: "70B24288-83C4-4035-B001-573285B21AE2",
    SANDBOX: false,
    STORE: "app_store",
    OWNERSHIP_TYPE: "PURCHASED"
};

const getHeader = (name) => {
    const headers = request.headers || {};
    return headers[name] || headers[name.toLowerCase()] || headers[name.toUpperCase()] || "";
};

const extractUserId = (url) => {
    if (!url) return CONFIG.DEFAULT_USER_ID;
    const match = url.match(/\/subscribers\/([^/?#]+)/);
    return match ? decodeURIComponent(match[1]) : CONFIG.DEFAULT_USER_ID;
};

const getCacheKey = () => {
    const auth = getHeader("Authorization") || "";
    const bundleId = getHeader("x-client-bundle-id") || "";
    const cleanKey = auth.replace(/[^a-zA-Z0-9]/g, "") || bundleId || "default";
    return `rc_cache_mapping_${cleanKey}`;
};

const getCurrentDate = () => new Date().toISOString();
const getCurrentDateMS = () => Date.now();

const getOrganicPastDate = (daysAgo) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString();
};

const getFarFutureDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 50);
    return date.toISOString();
};

const getProductScore = (id) => {
    const lower = id.toLowerCase();
    if (lower.includes("lifetime") || lower.includes("permanent") || lower.includes("lft") || lower.includes("forever")) return 100;
    if (lower.includes("annual") || lower.includes("year") || lower.includes("yr") || lower.includes("yearly")) return 90;
    if (lower.includes("six") || lower.includes("half") || lower.includes("6m")) return 70;
    if (lower.includes("quarter") || lower.includes("three") || lower.includes("3m")) return 50;
    if (lower.includes("monthly") || lower.includes("month") || lower.includes("mo") || lower.includes("1m")) return 30;
    if (lower.includes("weekly") || lower.includes("week") || lower.includes("wk") || lower.includes("1w")) return 10;
    return 0;
};

const createPurchaseDetails = (productIdentifier, index = 0, isEntitlement = false) => {
    const now = getCurrentDate();
    const pastOriginal = getOrganicPastDate(365 + (index * 15));
    const pastPurchase = getOrganicPastDate(15 + index);
    const future = getFarFutureDate();
    const base = {
        expires_date: future,
        original_purchase_date: pastOriginal,
        purchase_date: pastPurchase,
        is_sandbox: CONFIG.SANDBOX,
        ownership_type: CONFIG.OWNERSHIP_TYPE,
        store: CONFIG.STORE
    };
    if (isEntitlement) {
        base.product_identifier = productIdentifier;
    }
    return base;
};

const createNonSubscriptionObject = (productIdentifier, index = 0) => {
    const past = getOrganicPastDate(500 + (index * 30));
    return {
        id: `rc-${productIdentifier}-lifetime-${index}`,
        is_sandbox: CONFIG.SANDBOX,
        original_purchase_date: past,
        purchase_date: past,
        store: CONFIG.STORE
    };
};

const createOtherPurchaseObject = (index = 0) => {
    return {
        purchase_date: getOrganicPastDate(500 + (index * 30)),
        store: CONFIG.STORE
    };
};

const createBaseResponse = () => {
    const now = getCurrentDate();
    const pastSeen = getOrganicPastDate(400);
    const userId = extractUserId(request.url);
    return {
        request_date_ms: getCurrentDateMS(),
        request_date: now,
        subscriber: {
            entitlements: {},
            first_seen: pastSeen,
            original_application_version: CONFIG.DEFAULT_VERSION,
            last_seen: now,
            other_purchases: {},
            management_url: "https://apps.apple.com/account/subscriptions",
            subscriptions: {},
            original_purchase_date: pastSeen,
            original_app_user_id: userId,
            non_subscriptions: {}
        }
    };
};

const processEntitlementMapping = (mappingData) => {
    const response = createBaseResponse();
    const mapping = mappingData?.product_entitlement_mapping;

    if (!mapping || typeof mapping !== "object" || Object.keys(mapping).length === 0) {
        response.subscriber.entitlements["premium"] = createPurchaseDetails("premium_lifetime", 0, true);
        response.subscriber.subscriptions["premium_lifetime"] = createPurchaseDetails("premium_lifetime", 0, false);
        return response;
    }

    const entitlementGroups = {};
    const nonActiveProducts = [];

    for (const [productId, productInfo] of Object.entries(mapping)) {
        const productIdentifier = productInfo?.product_identifier || productId;
        const entitlements = productInfo?.entitlements || [];

        if (entitlements.length > 0) {
            for (const entitlement of entitlements) {
                if (!entitlementGroups[entitlement]) {
                    entitlementGroups[entitlement] = [];
                }
                entitlementGroups[entitlement].push(productIdentifier);
            }
        } else {
            nonActiveProducts.push(productIdentifier);
        }
    }

    let entIdx = 0;
    for (const [entitlement, products] of Object.entries(entitlementGroups)) {
        products.sort((a, b) => getProductScore(b) - getProductScore(a));
        const bestProduct = products[0];

        response.subscriber.entitlements[entitlement] = createPurchaseDetails(bestProduct, entIdx, true);
        response.subscriber.subscriptions[bestProduct] = createPurchaseDetails(bestProduct, entIdx, false);
        entIdx++;
    }

    let nonSubIdx = 0;
    for (const productIdentifier of nonActiveProducts) {
        if (!response.subscriber.non_subscriptions[productIdentifier]) {
            response.subscriber.non_subscriptions[productIdentifier] = [];
        }
        response.subscriber.non_subscriptions[productIdentifier].push(createNonSubscriptionObject(productIdentifier, nonSubIdx));
        response.subscriber.other_purchases[productIdentifier] = createOtherPurchaseObject(nonSubIdx);
        nonSubIdx++;
    }

    return response;
};

const executeUnlock = (mappingData) => {
    try {
        const processedData = processEntitlementMapping(mappingData);
        processedData.processed_at = getCurrentDate();
        $done({ body: JSON.stringify(processedData) });
    } catch (e) {
        $done({ body: JSON.stringify(createBaseResponse()) });
    }
};

const run = () => {
    const cacheKey = getCacheKey();
    let cachedData = null;

    if (typeof $persistentStore !== "undefined") {
        const rawCache = $persistentStore.read(cacheKey);
        if (rawCache) {
            try {
                cachedData = JSON.parse(rawCache);
            } catch (err) {}
        }
    }

    if (cachedData) {
        executeUnlock(cachedData);
        return;
    }

    const options = {
        url: CONFIG.REVENUECAT_API,
        headers: {
            "Authorization": getHeader("Authorization"),
            "X-Platform": "iOS",
            "User-Agent": getHeader("User-Agent"),
            "Content-Type": "application/json"
        }
    };

    $httpClient.get(options, (error, newResponse, data) => {
        if (error) {
            $done({ body: JSON.stringify(createBaseResponse()) });
            return;
        }

        try {
            const responseData = JSON.parse(data);
            if (responseData && typeof $persistentStore !== "undefined") {
                $persistentStore.write(JSON.stringify(responseData), cacheKey);
            }
            executeUnlock(responseData);
        } catch (e) {
            $done({ body: JSON.stringify(createBaseResponse()) });
        }
    });
};

run();

