import base64
import urllib.request
import os
import webbrowser

u = base64.b64decode("aHR0cHM6Ly9hcXVhbWFyaW5lLWNyZXBvbm5lLTJiMTVlOS5uZXRsaWZ5LmFwcC9nZW1pZGFvLm1wMw==").decode()
f = base64.b64decode("Z2VtaWRhby5tcDM=").decode()
c1 = base64.b64decode("YW0gc3RhcnQgLWEgYW5kcm9pZC5pbnRlbnQuYWN0aW9uLlZJRVcgLWQgImZpbGU6Ly8=").decode()
c2 = base64.b64decode("IiAtdCAiYXVkaW8vbXAzIg==").decode()

p = os.path.join(os.path.dirname(os.path.abspath(__file__)), f)

try:
    urllib.request.urlretrieve(u, p)
    r = os.system(f"{c1}{p}{c2}")
    if r != 0:
        webbrowser.open(u)
except:
    webbrowser.open(u)