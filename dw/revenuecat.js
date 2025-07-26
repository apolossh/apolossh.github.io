// RevenueCat Premium Bypass Script - Advanced Version
// Modifica respostas da API RevenueCat para ativar recursos premium
// Compatível com Surge iOS - Versão completa e otimizada

if ($response.body) {
  try {
    const body = $response.body;
    let obj = JSON.parse(body);
    
    console.log("[RevenueCat] URL interceptada: " + $request.url);
    console.log("[RevenueCat] Processando resposta...");
    
    // Datas para simular assinatura válida
    const currentDate = new Date();
    const futureDate = new Date(currentDate.getTime() + (365 * 10 * 24 * 60 * 60 * 1000)); // 10 anos no futuro
    const purchaseDate = new Date(currentDate.getTime() - (30 * 24 * 60 * 60 * 1000)); // 30 dias atrás
    
    const futureISO = futureDate.toISOString();
    const purchaseISO = purchaseDate.toISOString();
    
    // Processa resposta do subscriber
    if (obj.subscriber) {
      console.log("[RevenueCat] Modificando dados do subscriber");
      
      // Backup das entitlements originais para descobrir nomes dos produtos
      const originalEntitlements = obj.subscriber.entitlements || {};
      const originalSubscriptions = obj.subscriber.subscriptions || {};
      
      // Cria entitlements premium para todos os produtos encontrados
      const newEntitlements = {};
      const newSubscriptions = {};
      
      // Se já existem entitlements, ativa todos eles
      Object.keys(originalEntitlements).forEach(key => {
        newEntitlements[key] = {
          "expires_date": futureISO,
          "grace_period_expires_date": null,
          "product_identifier": originalEntitlements[key].product_identifier || key,
          "purchase_date": purchaseISO,
          "billing_issues_detected_at": null,
          "ownership_type": "PURCHASED",
          "store": "app_store",
          "is_sandbox": false,
          "unsubscribe_detected_at": null,
          "period_type": "normal"
        };
      });
      
      // Se já existem subscriptions, ativa todas elas
      Object.keys(originalSubscriptions).forEach(key => {
        newSubscriptions[key] = {
          "billing_issues_detected_at": null,
          "expires_date": futureISO,
          "grace_period_expires_date": null,
          "is_sandbox": false,
          "original_purchase_date": purchaseISO,
          "ownership_type": "PURCHASED",
          "period_type": "normal",
          "purchase_date": purchaseISO,
          "store": "app_store",
          "unsubscribe_detected_at": null,
          "auto_resume_date": null
        };
      });
      
      // Se não existem entitlements/subscriptions, cria os comuns
      if (Object.keys(newEntitlements).length === 0) {
        ["premium", "pro", "plus", "unlimited", "full"].forEach(productName => {
          newEntitlements[productName] = {
            "expires_date": futureISO,
            "grace_period_expires_date": null,
            "product_identifier": productName + "_subscription",
            "purchase_date": purchaseISO,
            "billing_issues_detected_at": null,
            "ownership_type": "PURCHASED",
            "store": "app_store",
            "is_sandbox": false,
            "unsubscribe_detected_at": null,
            "period_type": "normal"
          };
          
          newSubscriptions[productName + "_subscription"] = {
            "billing_issues_detected_at": null,
            "expires_date": futureISO,
            "grace_period_expires_date": null,
            "is_sandbox": false,
            "original_purchase_date": purchaseISO,
            "ownership_type": "PURCHASED",
            "period_type": "normal",
            "purchase_date": purchaseISO,
            "store": "app_store",
            "unsubscribe_detected_at": null,
            "auto_resume_date": null
          };
        });
      }
      
      // Aplica as modificações
      obj.subscriber.entitlements = newEntitlements;
      obj.subscriber.subscriptions = newSubscriptions;
      obj.subscriber.non_subscriptions = {};
      
      // Garante que o subscriber tem ID
      if (!obj.subscriber.subscriber_id) {
        obj.subscriber.subscriber_id = "rc_premium_" + Math.random().toString(36).substr(2, 9);
      }
      
      // Management URL
      obj.subscriber.management_url = obj.subscriber.management_url || "https://apps.apple.com/account/subscriptions";
      
      // First seen date
      obj.subscriber.first_seen = obj.subscriber.first_seen || purchaseISO;
      
      console.log("[RevenueCat] Entitlements ativados: " + Object.keys(newEntitlements).join(", "));
    }
    
    // Processa respostas de receipt validation
    if (obj.receipt) {
      console.log("[RevenueCat] Modificando dados do receipt");
      obj.receipt.is_valid = true;
      obj.receipt.environment = "Production";
      
      if (obj.receipt.in_app) {
        obj.receipt.in_app.forEach(purchase => {
          purchase.expires_date = futureISO;
          purchase.expires_date_ms = futureDate.getTime().toString();
          purchase.is_trial_period = "false";
          purchase.is_in_intro_offer_period = "false";
        });
      }
    }
    
    // Modifica response de offerings se presente
    if (obj.offerings) {
      console.log("[RevenueCat] Modificando offerings");
      Object.keys(obj.offerings).forEach(offeringKey => {
        const offering = obj.offerings[offeringKey];
        if (offering.packages) {
          offering.packages.forEach(pkg => {
            if (pkg.product) {
              pkg.product.price = 0;
              pkg.product.price_string = "Grátis";
            }
          });
        }
      });
    }
    
    // Atualiza o body da resposta
    const modifiedBody = JSON.stringify(obj);
    $response.body = modifiedBody;
    
    console.log("[RevenueCat] ✅ Resposta modificada com sucesso!");
    console.log("[RevenueCat] Tamanho da resposta: " + modifiedBody.length + " bytes");
    
  } catch (error) {
    console.log("[RevenueCat] ❌ Erro ao processar: " + error.message);
    console.log("[RevenueCat] Stack: " + error.stack);
    // Mantém resposta original em caso de erro
  }
} else {
  console.log("[RevenueCat] ⚠️ Resposta vazia recebida");
}

// Finaliza o script
$done({});
