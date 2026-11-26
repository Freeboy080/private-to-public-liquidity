import json, urllib.request, datetime
RAYLS = "https://mainnet-rpc.rayls.com"
POLY = "https://polygon-bor-rpc.publicnode.com"
BRL1P = "0xA069d3798FEAb32994aC5D98A9F011DA6024f334"
BRL1 = "0x5C067C80C00eCd2345b05E83A3e758eF799C40B5"
POLY_BRIDGE = "0x3Ea6BaC7d4138BcC126D0F17aE10122B3620abA6"
def call(rpc, to, data):
    d = {"jsonrpc": "2.0", "id": 1, "method": "eth_call", "params": [{"to": to, "data": data}, "latest"]}
    r = urllib.request.Request(rpc, json.dumps(d).encode(), {"content-type": "application/json", "User-Agent": "Mozilla/5.0"})
    return int(json.load(urllib.request.urlopen(r, timeout=30))["result"], 16)
def block(rpc):
    d = {"jsonrpc": "2.0", "id": 1, "method": "eth_blockNumber", "params": []}
    r = urllib.request.Request(rpc, json.dumps(d).encode(), {"content-type": "application/json", "User-Agent": "Mozilla/5.0"})
    return int(json.load(urllib.request.urlopen(r, timeout=30))["result"], 16)
print("step 1: run time", datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S"), "UTC")
print("step 2: Rayls side, BRL1.p totalSupply")
sup = call(RAYLS, BRL1P, "0x18160ddd"); print("   block", block(RAYLS), "| supply raw", sup)
print("step 3: Polygon side, BRL1 held by the bridge contract")
bal = call(POLY, BRL1, "0x70a08231" + POLY_BRIDGE[2:].lower().rjust(64, "0")); print("   block", block(POLY), "| balance raw", bal)
print("step 4: compare")
print("   difference raw:", bal - sup, "| supply", sup / 1e18, "| locked", bal / 1e18)
print("   note: the two reads are a few seconds apart, so a bridge in progress can show a small difference")
