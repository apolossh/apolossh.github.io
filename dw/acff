const url = $request.url;

if (url.includes("/api/v2/oauth/guest/token:grant")) {
    try {
        let body = JSON.parse($request.body);
        const registerUrl = "https://100067.connect.garena.com/api/v2/oauth/guest:register";
        
        const registerBody = {
            "password": body.password,
            "source": body.source || 1,
            "client_type": body.client_type || 1,
            "app_id": Number(body.client_id) || 100067
        };
        
        const headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": $request.headers["User-Agent"] || $request.headers["user-agent"]
        };
        
        if ($request.headers["authorization"]) {
            headers["authorization"] = $request.headers["authorization"];
        } else if ($request.headers["Authorization"]) {
            headers["Authorization"] = $request.headers["Authorization"];
        }

        $httpClient.post({
            url: registerUrl,
            headers: headers,
            body: JSON.stringify(registerBody)
        }, function(error, response, data) {
            if (!error && response.status === 200) {
                try {
                    let resData = JSON.parse(data);
                    
                    if (resData.code === 0 && resData.data && resData.data.uid) {
                        if (String(body.uid) !== String(resData.data.uid)) {
                            body.uid = resData.data.uid;
                            $done({ body: JSON.stringify(body) });
                            return;
                        }
                    }
                } catch (e) {}
            }
            $done({});
        });
    } catch (e) {
        $done({});
    }
} else {
    $done({});
}
