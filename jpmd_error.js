
const req = require;
const { ethers } = req("ethers");
const P = new ethers.JsonRpcProvider("https://mainnet.base.org");
const T = "0x7e0aedc93d9f898be835a44bfca3842e52416b82";
const TARGET = "0x1a59ff33";
const NAMES = ["Unauthorized","AccountNotWhitelisted","AccountNotAllowed","NotWhitelisted","SenderNotWhitelisted","NotAuthorized","UnauthorizedAccount",
 "InvalidSender","ERC20InvalidSender","AddressNotAllowed","AccountNotApproved","SenderNotAllowed","AccountIsNotAllowed","NotAllowlisted",
 "AccountNotAllowlisted","SenderBlocked","RecipientNotAllowed","Blocked","Blacklisted","AccountBlacklisted","AccountFrozen","AccountNotKYCed",
 "NotKYCed","KycRequired","NotApproved","NotPermitted","AccountNotPermitted","SenderNotPermitted","UnauthorizedSender","AccountNotVerified","NotVerified","AccountNotRegistered","NotRegistered","AccountNotEligible","NotEligible","SenderNotEligible"];
(async () => {
  console.log("step 1: matching the error selector", TARGET, "against", NAMES.length, "candidate names");
  let hit = null;
  for (const n of NAMES) { for (const args of ["(address)", "()", "(address,address)"]) { if (ethers.id(n + args).startsWith(TARGET)) hit = n + args; } }
  console.log("   match:", hit || "none of the candidates");
  const a = ethers.Wallet.createRandom().address, b = ethers.Wallet.createRandom().address;
  console.log("\nstep 2: simulated calls from a random address (eth_call only)");
  console.log("   random sender   :", a);
  console.log("   random recipient:", b);
  const I = new ethers.Interface(["function transfer(address,uint256)","function approve(address,uint256)","function balanceOf(address) view returns (uint256)"]);
  const tests = [["transfer(recipient, 0)", I.encodeFunctionData("transfer", [b, 0])], ["approve(recipient, 0)", I.encodeFunctionData("approve", [b, 0])]];
  for (const [label, data] of tests) {
    try { const r = await P.call({ from: a, to: T, data }); console.log("  ", label, "-> succeeded", r); }
    catch (e) { const d = e.data || ""; console.log("  ", label, "-> reverted, selector", d.slice(0, 10), "| argument", d.length >= 74 ? "0x" + d.slice(34, 74) : "none"); }
  }
  console.log("\nstep 3: a public read from the same unknown address");
  try { const r = await P.call({ from: a, to: T, data: I.encodeFunctionData("balanceOf", [b]) }); console.log("   balanceOf(recipient) ->", r, "(read works)"); }
  catch (e) { console.log("   balanceOf reverted:", (e.shortMessage || e.message).slice(0, 120)); }
  console.log("\ndone");
})();
