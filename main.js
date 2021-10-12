//import BigNumber from "bignumber.js";

// connect to metamask
const ethereumButton = document.querySelector('#enableEthereumButton');
const transactionStatus = document.getElementById('transactionStatus');
transactionStatus.innerHTML = "Metamask not connected";

// approve coin buttons
const approveDaiButton = document.querySelector('#approveDaiButton');
const approveUsdcButton = document.querySelector('#approveUsdcButton');
const approveUsdtButton = document.querySelector('#approveUsdtButton');
const approveLPButton = document.querySelector('#approveLPButton');

// deposit button
// TODO: rename "deposit Dai" to "deposit"
const depositButton = document.querySelector('#depositButton');
const DaiDepositConfirmation = document.getElementById('DaiDepositConfirmation');
DaiDepositConfirmation.innerHTML = "Deposit not initiated";
const DaiToDeposit = document.getElementById('DaiToDeposit');
const depositUsdcButton = document.querySelector('#depositUsdcButton');
const depositUsdtButton = document.querySelector('#depositUsdtButton');

// swap button
const swapButton = document.querySelector('#swapButton');
const swapTokenIndexIn = document.getElementById('SwapTokenIndexIn');
const swapTokenIndexOut = document.getElementById('SwapTokenIndexOut');
const swapAmountIn = document.getElementById('SwapAmountIn');

// show selected addres button
const showSelectedButton = document.querySelector('#showSelectedButton');
const selectedConfirmation = document.getElementById('selectedConfirmation');

// imbalanced Withdrawal
const imbalancedDAIOut = document.getElementById('imbalancedDAIOut');
const imbalancedUSDCOut = document.getElementById('imbalancedUSDCOut');
const imbalancedUSDTOut = document.getElementById('imbalancedUSDTOut');
const withdrawImbalancedButton = document.querySelector('#withdrawImbalancedButton');

// single token withdrawal
const singleTokenIndex = document.getElementById('singleTokenIndex');
const singleTokenAmount = document.getElementById('singleTokenAmount');
const withdrawSingleToken = document.querySelector('#withdrawSingleButton');

// reward claim button
const getRewardsButton = document.querySelector('#getRewardsButton');

// accounts (for metamask)
let accounts = [];

// Transaction encoding params
const twentyFourZeroes =        '000000000000000000000000';
const sixtyThreeZeroes =        '000000000000000000000000000000000000000000000000000000000000000';
const maxApprovalAmount =       'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';   
const fakeswapAddressPadded =   '000000000000000000000000eADfEa5f18c1E1D5030dd352f293d78865a264a2';
const fakeDaiAddress =          '0xa277bc1c1612Bb327D79746475aF29F7a93e8E64';
const fakeUsdcAddress =         '0x88c784FACBE88A20601A32Bd98d9Da8d59d08F92';
const fakeUsdtAddress =         '0xa479351d97e997EbCb453692Ef16Ce06730bEBF4';
const fakeswapAddress =         '0xeADfEa5f18c1E1D5030dd352f293d78865a264a2';
const fakeLPAddress =           '0x410a69Cdb3320594019Ef14A7C3Fb4Abaf6e962e';
const rewardClaimMsgData =      "0xc00007b00000000000000000000000001d7216e115f8884016004e3f390d824f0cec4afc";
const rewardsContractAddress =  "0x82cCDecF87141190F6A69321FB88F040aff83B08"; 
const fakeJoinerAddress =       "0x1ECDA0eD59708222A6cb6B20Ee4A011CAe557d0e";

ethereumButton.addEventListener('click', () => {
  //Will Start the metamask extension
  getAccount();
  console.log("ya clicked the connect button");
});

approveDaiButton.addEventListener('click', () => {
    
    //approves Fake DAI for transfer into the stableswap frontend
    const approveDaiTransactionParameters = {
        nonce: '0x00', // ignored by MetaMask

        // gasPrice is 1 Gwei
        gasPrice: '0x3B9ACA00', // customizable by user during MetaMask confirmation.
        gas: '0x0186A0', // customizable by user during MetaMask confirmation.
        to: fakeDaiAddress, // Required except during contract publications.
        from: ethereum.selectedAddress, // must match user's active address.
        value: '0x00', // Only required to send ether to the recipient from the initiating external account.
        data:
          '0x095ea7b3'
          + fakeswapAddressPadded
          + maxApprovalAmount, // Optional, but used for defining smart contract creation and interaction.
        chainId: '0x7a', // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
      };
      
      // txHash is a hex string
      // As with any RPC call, it may throw an error
      const txHash = ethereum.request({
        method: 'eth_sendTransaction',
        params: [approveDaiTransactionParameters],
      });

    console.log("clicked the approve Dai button");
});

approveUsdcButton.addEventListener('click', () => {
    
    //approves Fake USDC for transfer into the stableswap frontend
    const approveUsdcTransactionParameters = {
        nonce: '0x00', // ignored by MetaMask

        // gasPrice is 1 Gwei
        gasPrice: '0x3B9ACA00', // customizable by user during MetaMask confirmation.
        gas: '0x0186A0', // customizable by user during MetaMask confirmation.
        to: fakeUsdcAddress, // Required except during contract publications.
        from: ethereum.selectedAddress, // must match user's active address.
        value: '0x00', // Only required to send ether to the recipient from the initiating external account.
        data:
          '0x095ea7b3'
          + fakeswapAddressPadded
          + maxApprovalAmount, // Optional, but used for defining smart contract creation and interaction.
        chainId: '0x7a', // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
      };
      
      // txHash is a hex string
      // As with any RPC call, it may throw an error
      const txHash = ethereum.request({
        method: 'eth_sendTransaction',
        params: [approveUsdcTransactionParameters],
      });

    console.log("clicked the approve Dai button");
});

approveUsdtButton.addEventListener('click', () => {
    
    //approves Fake USDC for transfer into the stableswap frontend
    const approveUsdtTransactionParameters = {
        nonce: '0x00', // ignored by MetaMask

        // gasPrice is 1 Gwei
        gasPrice: '0x3B9ACA00', // customizable by user during MetaMask confirmation.
        gas: '0x0186A0', // customizable by user during MetaMask confirmation.
        to: fakeUsdtAddress, // Required except during contract publications.
        from: ethereum.selectedAddress, // must match user's active address.
        value: '0x00', // Only required to send ether to the recipient from the initiating external account.
        data:
          '0x095ea7b3'
          + fakeswapAddressPadded
          + maxApprovalAmount, // Optional, but used for defining smart contract creation and interaction.
        chainId: '0x7a', // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
      };
      
      // txHash is a hex string
      // As with any RPC call, it may throw an error
      const txHash = ethereum.request({
        method: 'eth_sendTransaction',
        params: [approveUsdtTransactionParameters],
      });

    console.log("clicked the approve Dai button");
});

approveLPButton.addEventListener('click', () => {

  const approveLPTokenTransactionParameters = {
    nonce: '0x00', //ignored by metamask

    // gasPrice is 1 gwei
    gasPrice: '0x3B9ACA00', // customizable by user during MetaMask confirmation.
    gas: '0x0186A0', // customizable by user during MetaMask confirmation.
    to: fakeLPAddress, // Required except during contract publications.
    from: ethereum.selectedAddress, // must match user's active address.
    value: '0x00', // Only required to send ether to the recipient from the initiating external account.
    data:
      '0x095ea7b3'
      + fakeswapAddressPadded
      + maxApprovalAmount, // Optional, but used for defining smart contract creation and interaction.
    chainId: '0x7a', // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
  };
  
  const txHash = ethereum.request({
    method: 'eth_sendTransaction',
    params: [approveLPTokenTransactionParameters],
  });

  console.log("clicked the approve LP tokens button");
});

depositButton.addEventListener('click', () => {

  // DAI ---
    // grab the value from the form
    let daiInput = DaiToDeposit.value;

    // convert to "wei" representation
    // TODO: fix precision losses here
    let daiWei = daiInput * 1e+18;
    
    // parses the number into a hex string
    let daiHex = daiWei.toString(16);

    // gets the length of the hex string
    let daiHexLength = daiHex.length;

    // set up padded hex string. Pad it to 64 digits by adding zero
    let daiPaddedHex = daiHex;
    for(let i = daiHexLength; i < 64; i++)
    {
      daiPaddedHex = "0" + daiPaddedHex;
    }
  // --------

  // USDC ---
    // grab val from form
    let usdcInput = UsdcToDeposit.value;

    // convert to wei
    // TODO assess precision lossiness
    let usdcWei = usdcInput * 1e+6;

    // parse to hex
    let usdcHex = usdcWei.toString(16);

    // get length of hex
    let usdcHexLength = usdcHex.length;

    // set up padded hex, pad to 64 digits
    let usdcPaddedHex = usdcHex
    for(let i = usdcHexLength; i < 64; i++)
    {
      usdcPaddedHex = "0" + usdcPaddedHex;
    }
  // ------------------

  // USDT ---
    // grab val from form
    let usdtInput = UsdtToDeposit.value;

    // convert to wei
    // TODO assess precision lossiness
    let usdtWei = usdtInput * 1e+6;

    // parse to hex
    let usdtHex = usdtWei.toString(16);

    // get length of hex
    let usdtHexLength = usdtHex.length;

    // set up padded hex, pad to 64 digits
    let usdtPaddedHex = usdtHex
    for(let i = usdtHexLength; i < 64; i++)
    {
      usdtPaddedHex = "0" + usdtPaddedHex;
    }
  // ------------------
    // construct the TX encoded data
    let funcSig = "0x4d49e87d";
    let txLengthOrSomething = "0000000000000000000000000000000000000000000000000000000000000060";   // TODO find out what this is
    let minToMint =           "0000000000000000000000000000000000000000000000000000000000000001"; 	// min to mint
    let deadline =            "0000000000000000000000000000000000000000000000000000000062eb4611";	  // deadline
    let amountArr =           "0000000000000000000000000000000000000000000000000000000000000003";	  // arr length
	  // Dai padded
	  // Usdc padded
	  // Usdt padded 
    let depositTxData = funcSig + txLengthOrSomething + minToMint + deadline + amountArr + daiPaddedHex + usdcPaddedHex + usdtPaddedHex;
  
    //approves Fake USDC for transfer into the stableswap frontend
    const depositTransactionParams = {
      nonce: '0x00', // ignored by MetaMask

      // gasPrice is 1 Gwei
      gasPrice: '0x3B9ACA00', // customizable by user during MetaMask confirmation.
      gas: '0x0F4240', // customizable by user during MetaMask confirmation.
      to: fakeswapAddress, // Required except during contract publications.
      from: ethereum.selectedAddress, // must match user's active address.
      value: '0x00', // Only required to send ether to the recipient from the initiating external account.
      data: depositTxData,
      chainId: '0x7a', // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
    };

    // txHash is a hex string
    // As with any RPC call, it may throw an error
    const txHash = ethereum.request({
        method: 'eth_sendTransaction',
        params: [depositTransactionParams],
      });

    
    DaiDepositConfirmation.innerHTML = "You clicked deposit! I saw it!";
});

showSelectedButton.addEventListener('click', () => {
    getLPBalance();
});

async function getAccount() {
    accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    transactionStatus.innerHTML = "Metamask connected";
}

async function getLPBalance() {

    // construct tx params
    let funcSig = "0x70a08231";

    // TODO: does ethereum.selectedAddress have the "0x" stripped off?
    //    we need it to not, and to have padding 0's
    let encodedBalanceTx = funcSig + twentyFourZeroes + ethereum.selectedAddress.slice(2,);

    LPBalance = await ethereum.request({ 
      method: 'eth_call',
      params:  [{
        to: fakeLPAddress,
        data: encodedBalanceTx
      }]
    }); 
    
    // TODO: rename elements from "selectedConfirmation" to something regarding getting LP balance
    selectedConfirmation.innerHTML = "Your LP Token balance: " + (parseInt(LPBalance,16) / 1e+18);

}

// TODO: build a withdrawal button
withdrawBalancedButton.addEventListener('click', () => {
  doWithdraw();
});

async function doWithdraw() {
  // get desired amount of LP tokens to withdraw
  let withdrawAmount = withdrawAmountInput.value;

  // func sig
  let funcSig = "0x31cd52b0";

  // multiply by 1e+18, then convert to hex
  let withdrawAmountScaled = withdrawAmount * 1e+18;
  let withdrawAmountHex = withdrawAmountScaled.toString(16);

  let withdrawPaddedHex = withdrawAmountHex;
  let withdrawHexLength = withdrawAmountHex.length;
  for(let i = withdrawHexLength; i < 64; i++)
  {
    withdrawPaddedHex = "0" + withdrawPaddedHex;
  }
  
  // set min amounts
  // TODO: actually pick some reasonable amounts (maybe a 5% max diff...?)
  //    might need to call "calculate withdraw tokens"
  // TODO: make deadline use local time plus reasonable window
  let remainderOfTx = "0000000000000000000000000000000000000000000000000000000000000060"  //dunno: TODO figure out
  +"0000000000000000000000000000000000000000000000000000000062eb4611" // deadline
  + "0000000000000000000000000000000000000000000000000000000000000003" // dunno: TODO
  + "0000000000000000000000000000000000000000000000000000000000000001" // min DAI to recieve = 1 unit
  + "0000000000000000000000000000000000000000000000000000000000000001"  // min USDC
  + "0000000000000000000000000000000000000000000000000000000000000001"; // min USDT

  let encodedWithdrawTxData = funcSig + withdrawPaddedHex + remainderOfTx;

  selectedConfirmation.innerHTML = "Withdrawing Balanced..."

  const withdrawTransactionParams = {
    nonce: '0x00', // ignored by MetaMask

    // gasPrice is 1 Gwei
    gasPrice: '0x3B9ACA00', // customizable by user during MetaMask confirmation.
    gas: '0x0F4240', // customizable by user during MetaMask confirmation.
    to: fakeswapAddress, // Required except during contract publications.
    from: ethereum.selectedAddress, // must match user's active address.
    value: '0x00', // Only required to send ether to the recipient from the initiating external account.
    data: encodedWithdrawTxData,
    chainId: '0x7a', // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
  };


  await ethereum.request({ 
    method: 'eth_sendTransaction',
    params: [withdrawTransactionParams]
  }); 

}

swapButton.addEventListener('click', () => {
  doSwap();
});

async function doSwap() {

  let tokenIndexIn = swapTokenIndexIn.value;
  let tokenIndexOut = swapTokenIndexOut.value;

  // pad token indexes (with 63 zeros, cuz we are lazy and they should always be one digit in hex)
  // since they should be 9 or less, we don't need to convert to hex since 0-9 is same in decimal and hex
  tokenIndexInPadded = sixtyThreeZeroes + tokenIndexIn;
  tokenIndexOutPadded = sixtyThreeZeroes + tokenIndexOut;

  // amountIn
  swapAmount = swapAmountIn.value

  let swapAmountScaled = 0;
  if(tokenIndexIn == 0)
  {
    swapAmountScaled = swapAmount * 1e+18;
  }
  else  // either usdc or usdt
  {
    swapAmountScaled = swapAmount * 1e+6;
  }

  swapAmountHex = swapAmountScaled.toString(16);
  swapAmountHexLength = swapAmountHex.length;

  swapAmountPadded = swapAmountHex;
  for(let i = swapAmountHexLength; i < 64; i++)
  {
    swapAmountPadded = "0" + swapAmountPadded;
  }

  // func sig
  let funcSig = "0x91695586";

  // min amount
  let minAmount = "0000000000000000000000000000000000000000000000000000000000000001";

  // deadline
  let deadline = "000000000000000000000000000000000000000000000000000000006ca33f73";

  // encode tx data:
  let encodedSwapData = funcSig + tokenIndexInPadded + tokenIndexOutPadded + swapAmountPadded + minAmount + deadline;

  const swapTransactionParams = {
    nonce: '0x00', // ignored by MetaMask

    // gasPrice is 1 Gwei
    gasPrice: '0x3B9ACA00', // customizable by user during MetaMask confirmation.
    gas: '0x0F4240', // customizable by user during MetaMask confirmation.
    to: fakeswapAddress, // Required except during contract publications.
    from: ethereum.selectedAddress, // must match user's active address.
    value: '0x00', // Only required to send ether to the recipient from the initiating external account.
    data: encodedSwapData,
    chainId: '0x7a', // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
  };


  await ethereum.request({ 
    method: 'eth_sendTransaction',
    params: [swapTransactionParams]
  }); 

}

withdrawImbalancedButton.addEventListener('click', () => {
  doImbalancedWithdraw();
});

async function doImbalancedWithdraw() {
  
  let imbalancedDAIOutVal = imbalancedDAIOut.value;
  let imbalancedUSDCOutVal = imbalancedUSDCOut.value;
  let imbalancedUSDTOutVal = imbalancedUSDTOut.value;
  // TODO add in optional amount of max LP tokens to burn

  let imbalancedDAIScaled = imbalancedDAIOutVal * 1e+18;
  let imbalancedUSDCScaled = imbalancedUSDCOutVal * 1e+6;
  let imbalancedUSDTScaled = imbalancedUSDTOutVal * 1e+6;
  
  let imbalancedDAIHex = imbalancedDAIScaled.toString(16);
  let imbalancedUSDCHex = imbalancedUSDCScaled.toString(16);
  let imbalancedUSDTHex = imbalancedUSDTScaled.toString(16);

  let DAIHexPadded = imbalancedDAIHex;
  for(let i = DAIHexPadded.length; i < 64; i++)
  {
    DAIHexPadded = "0" + DAIHexPadded;
  }

  let USDCHexPadded = imbalancedUSDCHex;
  for(let i = USDCHexPadded.length; i < 64; i++)
  {
    USDCHexPadded = "0" + USDCHexPadded;
  }

  let USDTHexPadded = imbalancedUSDTHex;
  for(let i = USDTHexPadded.length; i < 64; i++)
  {
    USDTHexPadded = "0" + USDTHexPadded;
  }

  // to get max burn amount, get their LP balance and set it to that
  let encodedBalanceTx = "0x70a08231" + twentyFourZeroes + ethereum.selectedAddress.slice(2,);

  let LPBalance = await ethereum.request({ 
    method: 'eth_call',
    params:  [{
      to: fakeLPAddress,
      data: encodedBalanceTx
    }]
  }); 

  console.log("LP Balance = " + LPBalance)

  let LPBalanceFormatted = LPBalance.slice(2,)

  let txEncoded = 
  "0x84cdd9bc" +                                                       //func sig
  "0000000000000000000000000000000000000000000000000000000000000060" + //array bullshit
  LPBalanceFormatted                                                 + // max burn amount
  "000000000000000000000000000000000000000000000000000000006ca33f73" + // deadline
  "0000000000000000000000000000000000000000000000000000000000000003" + // array bullshit
  DAIHexPadded +                                                       // DAI amount
  USDCHexPadded +                                                      // USDC amount
  USDTHexPadded;                                                       // USDT amount

  const imbalancedTransactionParams = {
    nonce: '0x00', // ignored by MetaMask

    // gasPrice is 1 Gwei
    gasPrice: '0x3B9ACA00', // customizable by user during MetaMask confirmation.
    gas: '0x0F4240', // customizable by user during MetaMask confirmation.
    to: fakeswapAddress, // Required except during contract publications.
    from: ethereum.selectedAddress, // must match user's active address.
    value: '0x00', // Only required to send ether to the recipient from the initiating external account.
    data: txEncoded,
    chainId: '0x7a', // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
  };


  await ethereum.request({ 
    method: 'eth_sendTransaction',
    params: [imbalancedTransactionParams]
  }); 

};

withdrawSingleButton.addEventListener('click', () => {
  doSingleWithdraw();
});

async function doSingleWithdraw() {

  let tokenIndexIn = singleTokenIndex.value;
  let tokenIndexHex = tokenIndexIn.toString(16);  //need this to ensure some jerk didn't put in like 0.7 or something. Should round to hex whole number

  let tokenAmountIn = singleTokenAmount.value;
  
  if(tokenIndexIn > 2) return;  //input sanitized B-]
  
  amountInHex = (tokenAmountIn * 1e+18).toString(16); //scaled by 1e18 cuz DAI be likethat
  


  // pad that
  amountInPadded = amountInHex
  for(let i = amountInHex.length; i < 64; i++)
  {
    amountInPadded = "0" + amountInPadded;
  }

  indexInPadded = sixtyThreeZeroes + tokenIndexHex;

  txData = 
  "0x3e3a1560" +                                                        // func sig
  amountInPadded +                                                      //amount LP in
  indexInPadded +                                                       //token index
  "0000000000000000000000000000000000000000000000000000000000000001" +  // min out
  "000000000000000000000000000000000000000000000000000000006ca33f73";  // deadline of 2027 ish
  
  const singleWithdrawTransaction = {
    nonce: '0x00', // ignored by MetaMask

    // gasPrice is 1 Gwei
    gasPrice: '0x3B9ACA00', // customizable by user during MetaMask confirmation.
    gas: '0x0F4240', // customizable by user during MetaMask confirmation.
    to: fakeswapAddress, // Required except during contract publications.
    from: ethereum.selectedAddress, // must match user's active address.
    value: '0x00', // Only required to send ether to the recipient from the initiating external account.
    data: txData,
    chainId: '0x7a', // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
  };

  await ethereum.request({ 
    method: 'eth_sendTransaction',
    params: [singleWithdrawTransaction]
  }); 


};

getRewardsButton.addEventListener('click', () => {
  doRewardClaim();
});

async function doRewardClaim() {

  const rewardClaimTx = {
    nonce: '0x00', //ignored by MetaMask
    gasPrice: '0x3B9ACA00',
    gas: '0x0F4240',
    to: rewardsContractAddress,
    from: ethereum.selectedAddress,
    value: '0x00',
    data: rewardClaimMsgData,
    chainId: '0x7a',
  };

  await ethereum.request({
    method: 'eth_sendTransaction',
    params: [rewardClaimTx]
  });
}


// TODO clean up this when no longer needed
/* SWAP TX
0x91695586
0000000000000000000000000000000000000000000000000000000000000000  // token index from
0000000000000000000000000000000000000000000000000000000000000001  // token index to
0000000000000000000000000000000000000000000000000de0b6b3a7640000  // amount in
0000000000000000000000000000000000000000000000000000000000000001  // min out
000000000000000000000000000000000000000000000000000000006ca33f73  // deadline
*/

/*
REMOVE LIQ IMBALANCED
0x84cdd9bc
0000000000000000000000000000000000000000000000000000000000000060  //array bullshit
0000000000000000000000000000000000000000000000056bc75e2d63100000  // max burn amount...?
000000000000000000000000000000000000000000000000000000006ca33f73  // deadline
0000000000000000000000000000000000000000000000000000000000000003  // array bullshit
000000000000000000000000000000000000000000000000016345785d8a0000  // DAI amount
00000000000000000000000000000000000000000000000000000000001e8480  // USDC amount
00000000000000000000000000000000000000000000000000000000002dc6c0  // USDT amount
*/

/*
REMOVE LIQ ONETOKEN 
0x3e3a1560
0000000000000000000000000000000000000000000000004563918244f40000  //amount LP in
0000000000000000000000000000000000000000000000000000000000000001  //token index
0000000000000000000000000000000000000000000000000000000000000001  // min out
000000000000000000000000000000000000000000000000000000006ca33f73  // deadline of 2027 ish
*/

// TODO: build a "claim rewards" button