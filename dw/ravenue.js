function modifyRevenueCatResponse(response) {
  try {
    let body = $response.body;
    let obj = JSON.parse(body);
    
    if (obj.subscriber) {
      // Modifica dados do subscriber para premium
      obj.subscriber.entitlements = {
        "premium": {
          "expires_date": "2099-12-31T23:59:59Z",
          "grace_period_expires_date": null,
          "product_identifier": "premium_subscription",
          "purchase_date": "2024-01-01T00:00:00Z"
        }
      };
      
      obj.subscriber.subscriptions = {
        "premium_subscription": {
          "billing_issues_detected_at": null,
          "expires_date": "2099-12-31T23:59:59Z",
          "grace_period_expires_date": null,
          "is_sandbox": false,
          "original_purchase_date": "2024-01-01T00:00:00Z",
          "ownership_type": "PURCHASED",
          "period_type": "normal",
          "purchase_date": "2024-01-01T00:00:00Z",
          "store": "app_store",
          "unsubscribe_detected_at": null
        }
      };
      
      obj.subscriber.non_subscriptions = {};
    }
    
    $response.body = JSON.stringify(obj);
  } catch (e) {
    console.log("Erro ao processar resposta RevenueCat: " + e);
  }
}