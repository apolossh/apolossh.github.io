var request = $request;

const options = {
    url: "https://api.revenuecat.com/v1/product_entitlement_mapping",
    headers: {
        'Authorization': request.headers["authorization"],
        'X-Platform': 'iOS',
        'User-Agent': request.headers["user-agent"]
    }
};

$httpClient.get(options, function (error, newResponse, data) {
    const ent = JSON.parse(data);

    const now = new Date();
    const requestDate = now.toISOString();
    const requestDateMs = now.getTime();

    const purchaseDate = requestDate;
    const expiresDate = new Date(now.setFullYear(now.getFullYear() + 1)).toISOString();

    let jsonToUpdate = {
        "request_date_ms": requestDateMs,
        "request_date": requestDate,
        "subscriber": {
            "entitlement": {},
            "first_seen": requestDate,
            "original_application_version": "9692",
            "last_seen": requestDate,
            "other_purchases": {},
            "management_url": null,
            "subscriptions": {},
            "entitlements": {},
            "original_purchase_date": purchaseDate,
            "original_app_user_id": "70B24288-83C4-4035-B001-573285B21AE2",
            "non_subscriptions": {}
        }
    };

    const productEntitlementMapping = ent.product_entitlement_mapping;

    for (const [entitlementId, productInfo] of Object.entries(productEntitlementMapping)) {
        const productIdentifier = productInfo.product_identifier;
        const entitlements = productInfo.entitlements;

        for (const entitlement of entitlements) {
            jsonToUpdate.subscriber.entitlements[entitlement] = {
                "purchase_date": purchaseDate,
                "original_purchase_date": purchaseDate,
                "expires_date": expiresDate,
                "is_sandbox": false,
                "ownership_type": "PURCHASED",
                "store": "app_store",
                "product_identifier": productIdentifier
            };

            jsonToUpdate.subscriber.subscriptions[productIdentifier] = {
                "expires_date": expiresDate,
                "original_purchase_date": purchaseDate,
                "purchase_date": purchaseDate,
                "is_sandbox": false,
                "ownership_type": "PURCHASED",
                "store": "app_store"
            };
        }
    }

    body = JSON.stringify(jsonToUpdate);
    $done({ body });
});
