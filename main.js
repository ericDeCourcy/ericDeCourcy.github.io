// accounts (for metamask)
let accounts = [];

const tabs = {
  connection: document.getElementById('metamaskConnection'),
  approval: document.getElementById('tokenApproval'),
  actions: document.getElementById('actions')
};

const actionSectionTitles = [
  document.getElementById('depositTitle'),
  document.getElementById('swapTitle'),
  document.getElementById('withdrawTitle'),
  document.getElementById('rewardsTitle')
];

const actionSections = [
  document.getElementById('deposit'),
  document.getElementById('swap'),
  document.getElementById('withdraw'),
  document.getElementById('rewards')
];

function selectSection(sectionNumber) {
  actionSections.forEach(element => {
    element.hidden = true;
  });
  actionSections[sectionNumber].hidden = false;
  actionSectionTitles.forEach(element => {
    element.classList.remove('activeSection');
  })
  actionSectionTitles[sectionNumber].classList.add('activeSection');
}

const withdrawalSubsectionTitles = [
  document.getElementById('balancedWithdrawalTitle'),
  document.getElementById('imbalancedWithdrawalTitle'),
  document.getElementById('singleWithdrawalTitle')
];

const withdrawalSubsections = [
  document.getElementById('balancedWithdrawal'),
  document.getElementById('imbalancedWithdrawal'),
  document.getElementById('singleWithdrawal')
];

function selectSubsection(subsectionNumber) {
  withdrawalSubsections.forEach(element => {
    element.hidden = true;
  });
  withdrawalSubsections[subsectionNumber].hidden = false;
  withdrawalSubsectionTitles.forEach(element => {
    element.classList.remove('activeSection');
  })
  withdrawalSubsectionTitles[subsectionNumber].classList.add('activeSection');
  if (subsectionNumber === 0) { 
    getLPBalance();
  }
}

const fakeLPAddress =           '0x410a69Cdb3320594019Ef14A7C3Fb4Abaf6e962e';
const arrayLength = '3'.padStart(64, '0');
const minAmount = '1'.padStart(64, '0');
// TODO eric can you rename these to something semantic plz
const txLengthMaybe = '60'.padStart(64, '0');
const deadline6ca33f73 = '6ca33f73'.padStart(64, '0'); // deadline of 2027-ish
const deadline62eb4611 = '62eb4611'.padStart(64, '0');


function getTransactionParams(transactionData) {
  return {
    nonce: '0x00',
    gasPrice: '0x3B9ACA00', // gasPrice is 1 Gwei. customizable by user during MetaMask confirmation.
    gas: '0x0F4240', // customizable by user during MetaMask confirmation.
    to: '0xeADfEa5f18c1E1D5030dd352f293d78865a264a2', // fake swap address
    from: ethereum.selectedAddress,
    value: '0x00', // Only required to send ether to the recipient from the initiating external account.
    data: transactionData,
    chainId: '0x7a', // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
  }
}


async function ethRequest(params, statusElement, loggingKeyword) {
  try {
    await ethereum.request({
      method: 'eth_sendTransaction',
      params: [params],
    });
    statusElement.innerHTML = `${loggingKeyword} successful!`;
  } catch (error) {
    statusElement.innerHTML = `${loggingKeyword} failed. See console log for details.`;
    console.error(`${loggingKeyword} failed: ${error.code} ${error.message}`);
  }
}


async function connectToMetamask(button) {
  button.disabled = true;
  console.log('Attempting to connect to Metamask...');
  
  const transactionStatus = document.getElementById('transactionStatus');
  
  try {
    if (!ethereum) {
      throw new ReferenceError('Could not access Metamask browser extension.');
    }
    accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    
    transactionStatus.innerHTML = 'Connected to Metamask.';
    console.log('Metamask connection succeeded.');
    continueToApprovalTab();
  } catch (error) {
    transactionStatus.innerHTML = 'Metamask connection failed. See console log for details.';
    console.error(`Failed to connect to metamask: ${error.code} ${error.message}`);
  } finally {
    button.disabled = false;
  }
}

function continueToApprovalTab() {
  tabs.connection.hidden = true;
  tabs.approval.hidden = false;
  tabs.actions.hidden = true;
}

//TODO alanna simplify this function
async function approveToken(button, tokenName, address, statusElementId) {
  button.disabled = true;
  console.log(`Clicked the 'Approve ${tokenName}' button.`);
  const statusMessage = document.getElementById(statusElementId);
  statusMessage.innerHTML = 'Attempting to approve token...';
  
  transactionData = 
    '0x095ea7b3'                                                    // function signature
    + 'eADfEa5f18c1E1D5030dd352f293d78865a264a2'.padStart(64, '0')  // fake swap address
    + ''.padStart(64, 'f');                                         // max amount
  transactionParams = getTransactionParams(transactionData);
  transactionParams['to'] = address;
  transactionParams['gas'] = '0x0186A0';
  
  let message = '';
  try {
    // request returns transaction hash
    await ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParams],
    });
    message = `Successfully approved ${tokenName}.`; 
  } catch(error) {
    message = `Could not approve ${tokenName}: ${error}`;
    console.error(message);
    button.disabled = false;
  } finally {
    statusMessage.innerHTML = message;
  }
}

async function approveDai(button) {
  const fakeDaiAddress = '0xa277bc1c1612Bb327D79746475aF29F7a93e8E64';
  await approveToken(button, 'Fake-DAI', fakeDaiAddress, 'approveDaiStatus');
}

async function approveUsdc(button) {
  const fakeUsdcAddress = '0x88c784FACBE88A20601A32Bd98d9Da8d59d08F92';
  await approveToken(button, 'Fake-USDC', fakeUsdcAddress, 'approveUsdcStatus');
}

async function approveUsdt(button) {
  const fakeUsdtAddress = '0xa479351d97e997EbCb453692Ef16Ce06730bEBF4';
  await approveToken(button, 'Fake-USDT', fakeUsdtAddress, 'approveUsdtStatus');
}

async function approveLP(button) {
  await approveToken(button, 'LP Token', fakeLPAddress, 'approveLPStatus');
}


function continueToActionsTab() {
  tabs.connection.hidden = true;
  tabs.approval.hidden = true;
  tabs.actions.hidden = false;
}

// TODO fix precision losses here
function getPaddedHexDai(inputElementId) {
  return getPaddedHex(document.getElementById(inputElementId).value * 1e+18);
}

// TODO assess precision lossiness
function getPaddedHexUsd(inputElementId) {
  return getPaddedHex(document.getElementById(inputElementId).value * 1e+6);
}

function getPaddedHex(input) {
  return input.toString(16).padStart(64, '0');
}

async function deposit(button) {
  button.disabled = true;
  statusElement = document.getElementById('depositStatus');
  statusElement.innerHTML = 'Attempting deposit...';
  
  let transactionData = 
    '0x4d49e87d' // function signature
    + txLengthMaybe
    + minAmount
    + deadline62eb4611
    + arrayLength
    + getPaddedHexDai('DaiToDeposit')
    + getPaddedHexUsd('UsdcToDeposit')
    + getPaddedHexUsd('UsdtToDeposit');

  //approves Fake USDC for transfer into the stableswap frontend
  const transactionParams = getTransactionParams(transactionData);

  await ethRequest(transactionParams, statusElement, 'Deposit');
  button.disabled = false;
}


async function getLPBalance() {
    // construct tx params
    let funcSig = '0x70a08231';

    // TODO: does ethereum.selectedAddress have the '0x' stripped off?
    //    we need it to not, and to have padding 0's
    let encodedBalanceTx = funcSig + ''.padStart(24, '0') + ethereum.selectedAddress.slice(2,);

    LPBalance = await ethereum.request({ 
      method: 'eth_call',
      params:  [{
        to: fakeLPAddress,
        data: encodedBalanceTx
      }]
    }); 
    
    document.getElementById('LPTokenBalance').innerHTML = 'Your LP Token balance: ' + (parseInt(LPBalance,16) / 1e+18);
}


async function swap(button) {
  button.disabled = true;
  statusElement = document.getElementById('swapStatus');
  statusElement.innerHTML = 'Attempting Swap...';

  const swapTokenIndexIn = document.getElementById('swapTokenIndexIn');
  const swapTokenIndexOut = document.getElementById('swapTokenIndexOut');
  const swapAmountIn = document.getElementById('swapAmountIn');

  // TODO eric - you performed the usual input formatting in a slightly different order in this one -
  // padding then scaling instead of vice versa. not sure if this matters. can you replace with my formatting
  // functions as above if applicable?
  let tokenIndexIn = swapTokenIndexIn.value;
  let tokenIndexOut = swapTokenIndexOut.value;

  // pad token indexes (with 63 zeros, cuz we are lazy and they should always be one digit in hex)
  // since they should be 9 or less, we don't need to convert to hex since 0-9 is same in decimal and hex
  tokenIndexInPadded = tokenIndexIn.padStart(64, '0');
  tokenIndexOutPadded = tokenIndexOut.padStart(64, '0');

  // amountIn
  swapAmount = swapAmountIn.value;

  let swapAmountScaled = 0;
  if(tokenIndexIn == 0)
  {
    swapAmountScaled = swapAmount * 1e+18;
  }
  else  // either usdc or usdt
  {
    swapAmountScaled = swapAmount * 1e+6;
  }
  
  const transactionData = 
    '0x91695586' // function signature
    + tokenIndexInPadded 
    + tokenIndexOutPadded 
    + getPaddedHex(swapAmountScaled) 
    + minAmount 
    + deadline6ca33f73;

  const transactionParams = getTransactionParams(transactionData);

  await ethRequest(transactionParams, statusElement, 'Swap');
  button.disabled = false;
}


async function withdrawBalanced(button) {
  button.disabled = true;
  statusElement = document.getElementById('withdrawBalancedStatus');
  statusElement.innerHTML = 'Attempting Balanced Withdrawal...';

  // get desired amount of LP tokens to withdraw
  let withdrawAmount = withdrawAmountInput.value;
  // multiply by 1e+18, then convert to hex
  let withdrawAmountScaled = withdrawAmount * 1e+18;
  let withdrawAmountHex = getPaddedHex(withdrawAmountScaled);

  // set min amounts
  // TODO: actually pick some reasonable amounts (maybe a 5% max diff...?)
  //    might need to call 'calculate withdraw tokens'
  // TODO: make deadline use local time plus reasonable window
  let transactionData = 
    '0x31cd52b0'        // function signature
    + withdrawAmountHex
    + txLengthMaybe
    + deadline62eb4611
    + arrayLength
    + minAmount         // min DAI to recieve = 1 unit
    + minAmount         // min USDC
    + minAmount;        // min USDT

  const transactionParams = getTransactionParams(transactionData);

  await ethRequest(transactionParams, statusElement, 'Balanced Withdrawal');
  button.disabled = false;
}


async function withdrawImbalanced(button) {
  button.disabled = true;
  statusElement = document.getElementById('withdrawImbalancedStatus');
  statusElement.innerHTML = 'Attempting Imbalanced Withdrawal...';

  // TODO add in optional amount of max LP tokens to burn
  // to get max burn amount, get their LP balance and set it to that
  let encodedBalanceTx = 
    '0x70a08231' 
    + twentyFourZeroes 
    + ethereum.selectedAddress.slice(2,);

  // TODO add await and error handling for this as well
  let LPBalance = await ethereum.request({ 
    method: 'eth_call',
    params:  [{
      to: fakeLPAddress,
      data: encodedBalanceTx
    }]
  }); 

  console.log('LP Balance = ' + LPBalance);
  let LPBalanceFormatted = LPBalance.slice(2,);

  let transactionData = 
    '0x84cdd9bc'                              // function signature
    + txLengthMaybe
    + LPBalanceFormatted                      // max burn amount
    + deadline6ca33f73
    + arrayLength
    + getPaddedHexDai('imbalancedDAIOut')
    + getPaddedHexUsd('imbalancedUSDCOut')
    + getPaddedHexUsd('imbalancedUSDTOut');

  const transactionParams = getTransactionParams(transactionData);
  
  await ethRequest(transactionParams, statusElement, 'Imbalanced Withdrawal');
  button.disabled = false;
}


async function withdrawSingleToken(button) {
  button.disabled = true;
  statusElement = document.getElementById('singleWithdrawStatus');
  statusElement.innerHTML = 'Attempting Single Token Withdrawal...';
  
  const singleTokenIndex = document.getElementById('singleTokenIndex');
  let tokenIndexIn = singleTokenIndex.value;
  let tokenIndexHex = tokenIndexIn.toString(16);  //need this to ensure some jerk didn't put in like 0.7 or something. Should round to hex whole number

  const singleTokenAmount = document.getElementById('singleTokenAmount');
  let tokenAmountIn = singleTokenAmount.value;
  
  // TODO eric shouldn't this be 18 or 6 depending on whether it's dai or usdX?
  // didn't use my convenience functions bc i wasn't sure if this was a special case...
  amountInHex = (tokenAmountIn * 1e+18).toString(16); //scaled by 1e18 cuz DAI be likethat

  const amountInPadded = amountInHex.padStart(64, '0');
  const indexInPadded = tokenIndexHex.padStart(64, '0');

  transactionData = 
    '0x3e3a1560'      // function signature
    + amountInPadded  // amount LP in
    + indexInPadded   // token index
    + minAmount;      // min out
  
  const transactionParams = getTransactionParams(transactionData);

  await ethRequest(transactionParams, statusElement, 'Single Token Withdrawal');
  button.disabled = false;
}


async function claimRewards(button) {
  button.disabled = true;
  statusElement = document.getElementById('getRewardsStatus');
  statusElement.innerHTML = 'Attempting to Claim Rewards...';

  const rewardClaimMessageData = '0xc00007b00000000000000000000000001d7216e115f8884016004e3f390d824f0cec4afc';
  const transactionParams = getTransactionParams(rewardClaimMessageData);
  transactionParams['to'] = '0x82cCDecF87141190F6A69321FB88F040aff83B08';

  ethRequest(transactionParams, statusElement, 'Claim Rewards');
  button.disabled = false;
}
