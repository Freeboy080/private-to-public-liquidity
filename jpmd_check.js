
const req = require;
const { ethers } = req("ethers");
const P = new ethers.JsonRpcProvider("https://mainnet.base.org");
const T = "0x7e0aedc93d9f898be835a44bfca3842e52416b82";
const IMPL_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
const ADMIN_SLOT = "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103";
const SIGS = ["paused()","pause()","unpause()","owner()","hasRole(bytes32,address)","grantRole(bytes32,address)","DEFAULT_ADMIN_ROLE()",
 "isBlacklisted(address)","blacklist(address)","isBlocked(address)","isAllowlisted(address)","isWhitelisted(address)","isFrozen(address)","freeze(address)",
 "mint(address,uint256)","burn(uint256)","burn(address,uint256)","forceTransfer(address,address,uint256)","canTransfer(address,address,uint256)",
 "detectTransferRestriction(address,address,uint256)","upgradeTo(address)","upgradeToAndCall(address,bytes)","proxiableUUID()","UPGRADE_INTERFACE_VERSION()"];
const addr = h => "0x" + h.slice(26);
(async () => {
  console.log("step 1: connect, run time", new Date().toISOString());
  console.log("   Base block", await P.getBlockNumber());
  console.log("\nstep 2: token basics");
  const erc = new ethers.Contract(T, ["function name() view returns (string)","function symbol() view returns (string)","function decimals() view returns (uint8)","function totalSupply() view returns (uint256)","function owner() view returns (address)","function paused() view returns (bool)"], P);
  for (const f of ["name","symbol","decimals","totalSupply","owner","paused"]) {
    try { console.log("  ", f + ":", String(await erc[f]())); } catch (e) { console.log("  ", f + ": (call failed)"); }
  }
  console.log("\nstep 3: proxy slots");
  const impl = addr(await P.getStorage(T, IMPL_SLOT));
  const admin = addr(await P.getStorage(T, ADMIN_SLOT));
  console.log("   implementation:", impl);
  console.log("   admin slot:", admin);
  console.log("\nstep 4: scanning implementation bytecode for known function selectors");
  const code = (await P.getCode(impl)).toLowerCase();
  console.log("   implementation code size (bytes):", (code.length - 2) / 2);
  for (const s of SIGS) {
    const sel = ethers.id(s).slice(2, 10);
    console.log("  ", code.includes(sel) ? "present" : "absent ", s);
  }
  console.log("\nstep 5: simulated transfer of 0 from a random address (eth_call, nothing is sent)");
  const a = ethers.Wallet.createRandom().address, b = ethers.Wallet.createRandom().address;
  const data = new ethers.Interface(["function transfer(address,uint256)"]).encodeFunctionData("transfer", [b, 0]);
  try { const r = await P.call({ from: a, to: T, data }); console.log("   result:", r, "(call succeeded)"); }
  catch (e) { console.log("   reverted:", (e.shortMessage || e.message).slice(0, 160), "| data:", e.data || "none"); }
  console.log("\ndone");
})();
