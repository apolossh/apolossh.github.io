// RevenueCat Premium Bypass Script
// Modifica as respostas da API RevenueCat para simular assinatura premium ativa
// Compatível com Surge iOS

function modifyRevenueCatResponse() {
  try {
    let body = $response.body;
    let obj = JSON.parse(body);
    
    console.log("[RevenueCat] Interceptando resposta da API");
    
    // Verifica se é uma resposta de subscriber
    if (obj.subscriber) {
      console.log("[RevenueCat] Modificando dados do subscriber");
      
      // Define data de expiração muito no futuro
      const futureDate = "2099-12-31T23:59:59Z";
      const purchaseDate = "2024-01-01T00:00:00Z";
      
      // Modifica entitlements para premium
      obj.subscriber.entitlements = {
        "premium": {
          "expires_date": futureDate,
          "grace_period_expires_date": null,
          "product_identifier": "premium_subscription",
          "purchase_date": purchaseDate,
          "billing_issues_detected_at": null,
          "ownership_type": "PURCHASED",
          "store": "app_store",
          "is_sandbox": false
        }
      };
      
      // Modifica subscriptions
      obj.subscriber.subscriptions = {
        "premium_subscription": {
          "billing_issues_detected_at": null,
          "expires_date": futureDate,
          "grace_period_expires_date": null,
          "is_sandbox": false,
          "original_purchase_date": purchaseDate,
          "ownership_type": "PURCHASED",
          "period_type": "normal",
          "purchase_date": purchaseDate,
          "store": "app_store",
          "unsubscribe_detected_at": null
        }
      };
      
      // Limpa non_subscriptions
      obj.subscriber.non_subscriptions = {};
      
      // Define subscriber ID se não existir
      if (!obj.subscriber.subscriber_id) {
        obj.subscriber.subscriber_id = "premium_user_" + Date.now();
      }
      
      // Define management_url se não existir
      if (!obj.subscriber.management_url) {
        obj.subscriber.management_url = "https://apps.apple.com/account/subscriptions";
      }
      
      console.log("[RevenueCat] Subscriber modificado com sucesso");
    }
    
    // Se for uma resposta de receipt/purchase
    if (obj.receipt || obj.purchase) {
      console.log("[RevenueCat] Modificando dados do receipt");
      
      const receiptData = obj.receipt || obj.purchase;
      if (receiptData) {
        receiptData.is_valid = true;
        receiptData.environment = "Production";
      }
    }
    
    $response.body = JSON.stringify(obj);
    console.log("[RevenueCat] Resposta modificada enviada");
    
  } catch (error) {
    console.log("[RevenueCat] Erro ao processar resposta: " + error.message);
    // Em caso de erro, mantém a resposta original
  }
}

// Executa a modificação
modifyRevenueCatResponse();