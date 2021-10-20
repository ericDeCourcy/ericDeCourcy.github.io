/* global tokens, fakePool */
const activePool = fakePool;

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


function getPaddedHex(input) {
  return input.toString(16).padStart(64, '0');
}

const tokenArrayLengthPadded = getPaddedHex(activePool.poolTokens.length);
const minAmountPadded = getPaddedHex('1');
// TODO Eric - figure out what this is
const txLengthMaybe = getPaddedHex('60');
const deadline6ca33f73Padded = getPaddedHex('6ca33f73'); // deadline of 2027-ish
const deadline62eb4611Padded = getPaddedHex('62eb4611');


function showAttempting(statusElement, loggingKeyword) {
  const message = `Attempting ${loggingKeyword}...`;
  console.log(message);
  statusElement.innerHTML = message;
}

function showSuccess(statusElement, loggingKeyword) {
  const message = `${loggingKeyword} successful!`;
  console.log(message);
  statusElement.innerHTML = message;
}

function showError(statusElement, loggingKeyword, error) {
  console.error(`${loggingKeyword} failed: ${error.code} ${error.message}`);
  statusElement.innerHTML = `${loggingKeyword} failed. See console log for details.`;
}


async function ethRequest(params, statusElement, loggingKeyword) {
  try {
    await ethereum.request({
      method: 'eth_sendTransaction',
      params: [params],
    });
    showSuccess(statusElement, loggingKeyword);
  } catch (error) {
    showError(statusElement, loggingKeyword, error);
  }
}

async function connectToMetamask(button) {
  button.disabled = true;
  const loggingKeyword = 'Metamask connection';
  const statusElement = document.getElementById('transactionStatus');
  showAttempting(statusElement, loggingKeyword);

  try {
    if (!ethereum) {
      throw new ReferenceError('Could not access Metamask browser extension.');
    }
    accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    showSuccess(statusElement, loggingKeyword);
    continueToApprovalTab();
  } catch (error) {
    showError(statusElement, loggingKeyword, error);
  } finally {
    button.disabled = false;
  }
}

function continueToApprovalTab() {
  tabs.connection.hidden = true;
  tabs.approval.hidden = false;
  tabs.actions.hidden = true;
  const tokenApprovalButtons = document.getElementById('tokenApprovalButtons');
  tokenApprovalButtons.innerHTML = activePool.getTokenApprovalHTML();
}

//TODO alanna simplify this function
async function approveToken(button, tokenId) {
  button.disabled = true;
  const token = tokens[tokenId];
  const loggingKeyword = token.name + ' approval';
  const statusElement = document.getElementById(`approve${token.name}Status`);
  showAttempting(statusElement, loggingKeyword);
  
  transactionData = 
    '0x095ea7b3'                                                    // function signature
    + activePool.address.replace(/^0x/, '').padStart(64, '0')       // fake swap address
    + ''.padStart(64, 'f');                                         // max amount
  transactionParams = activePool.getTransactionParams(transactionData);
  transactionParams['to'] = token.address;
  transactionParams['gas'] = '0x0186A0';
  
  try {
    await ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParams],
    });
    showSuccess(statusElement, loggingKeyword)
  } catch(error) {
    showError(statusElement, loggingKeyword, error);
    button.disabled = false;
  }
}


function continueToActionsTab() {
  tabs.connection.hidden = true;
  tabs.approval.hidden = true;
  tabs.actions.hidden = false;
  populateActionOptions();
}

function populateActionOptions() {
  const swapForm = document.getElementById('swapForm');
  swapForm.innerHTML += activePool.getSelectTokenHTML(
    'Token for swap input:', 'swapTokenIndexIn');
  swapForm.innerHTML += activePool.getSelectTokenHTML(
    'Token for swap output:', 'swapTokenIndexOut');
  
  const singleWithdrawalForm = document.getElementById('singleWithdrawalForm');
  singleWithdrawalForm.innerHTML = activePool.getSelectTokenHTML(
    'Withdrawal Token:', 'singleTokenIndex') + singleWithdrawalForm.innerHTML;
  
  const depositForm = document.getElementById('depositForm');
  depositForm.innerHTML = activePool.getInputTokenAmountHTML(
    'to deposit:', 'ToDeposit');

  const imbalancedWithdrawalForm = document.getElementById('imbalancedWithdrawalForm');
  imbalancedWithdrawalForm.innerHTML = activePool.getInputTokenAmountHTML(
    'desired:', 'ImbalancedOut');
}


async function deposit(button) {
  button.disabled = true;
  const loggingKeyword = 'Deposit';
  statusElement = document.getElementById('depositStatus');
  showAttempting(statusElement, loggingKeyword);
  
  let transactionData = 
    '0x4d49e87d' // function signature
    + txLengthMaybe
    + minAmountPadded
    + deadline62eb4611Padded
    + tokenArrayLengthPadded
    + activePool.getTokenValuesFromElements('ToDeposit');

  //approves Fake USDC for transfer into the stableswap frontend
  const transactionParams = activePool.getTransactionParams(transactionData);

  await ethRequest(transactionParams, statusElement, loggingKeyword);
  button.disabled = false;
}


async function getLPBalance() {
    // construct tx params
    let funcSig = '0x70a08231';

    let encodedBalanceTx = funcSig 
      + ''.padStart(24, '0') 
      + ethereum.selectedAddress.slice(2,);

    LPBalance = await ethereum.request({ 
      method: 'eth_call',
      params:  [{
        to: activePool.LPToken.address,
        data: encodedBalanceTx
      }]
    }); 
    
    document.getElementById('LPTokenBalance').innerHTML = 
      'Your LP Token balance: ' + (parseInt(LPBalance,16) / 1e+18);
}


async function swap(button) {
  button.disabled = true;
  const loggingKeyword = 'Swap';
  statusElement = document.getElementById('swapStatus');
  showAttempting(statusElement, loggingKeyword);

  const swapTokenIndexIn = document.getElementById('swapTokenIndexIn');
  const swapTokenIndexOut = document.getElementById('swapTokenIndexOut');
  const swapAmountIn = document.getElementById('swapAmountIn');

  let tokenIndexIn = swapTokenIndexIn.value;
  let tokenIndexOut = swapTokenIndexOut.value;

  let swapAmountScaled = swapAmountIn.value * activePool.poolTokens[tokenIndexIn].decimals;
  
  const transactionData = 
    '0x91695586' // function signature
    + getPaddedHex(tokenIndexIn) 
    + getPaddedHex(tokenIndexOut) 
    + getPaddedHex(swapAmountScaled) 
    + minAmountPadded 
    + deadline6ca33f73Padded;

  const transactionParams = activePool.getTransactionParams(transactionData);

  await ethRequest(transactionParams, statusElement, loggingKeyword);
  button.disabled = false;
}


async function withdrawBalanced(button) {
  button.disabled = true;
  const loggingKeyword = 'Balanced Withdrawal';
  statusElement = document.getElementById('withdrawBalancedStatus');
  showAttempting(statusElement, loggingKeyword);

  // get desired amount of LP tokens to withdraw
  let withdrawAmount = withdrawAmountInput.value;
  // multiply by 1e+18, then convert to hex
  let withdrawAmountScaled = withdrawAmount * 1e+18;
  let withdrawAmountHex = getPaddedHex(withdrawAmountScaled);

  let transactionData = 
    '0x31cd52b0'        // function signature
    + withdrawAmountHex
    + txLengthMaybe
    + deadline62eb4611Padded
    + tokenArrayLengthPadded
    // min amount to receive X number of pool tokens
    + minAmountPadded.repeat(activePool.poolTokens.length);

  const transactionParams = activePool.getTransactionParams(transactionData);

  await ethRequest(transactionParams, statusElement, loggingKeyword);
  button.disabled = false;
}


async function withdrawImbalanced(button) {
  button.disabled = true;
  const loggingKeyword = 'Imbalanced Withdrawal';
  statusElement = document.getElementById('withdrawImbalancedStatus');
  showAttempting(statusElement, loggingKeyword);

  let encodedBalanceTx = 
    '0x70a08231' 
    + ''.padStart(24, '0') 
    + ethereum.selectedAddress.slice(2,);

  let LPBalance = 0;
  try {
    LPBalance = await ethereum.request({
      method: 'eth_call',
      params:  [{
        to: activePool.LPToken.address,
        data: encodedBalanceTx
      }]
    }); 
    console.log(`LP Balance = ${LPBalance}.`);
  } catch (error) {
    showError(statusElement, loggingKeyword, error);
    button.disabled = false;
    return;
  }

  let LPBalanceFormatted = LPBalance.slice(2,);

  let transactionData = 
    '0x84cdd9bc'                              // function signature
    + txLengthMaybe
    + LPBalanceFormatted                      // max burn amount
    + deadline6ca33f73Padded
    + tokenArrayLengthPadded
    + activePool.getTokenValuesFromElements('ImbalancedOut');
  const transactionParams = activePool.getTransactionParams(transactionData);
  
  await ethRequest(transactionParams, statusElement, 'Imbalanced Withdrawal');
  button.disabled = false;
}


async function withdrawSingleToken(button) {
  button.disabled = true;
  const loggingKeyword = 'Single Token Withdrawal';
  statusElement = document.getElementById('singleWithdrawStatus');
  showAttempting(statusElement, loggingKeyword);

  const singleTokenIndex = document.getElementById('singleTokenIndex');
  let tokenIndexIn = singleTokenIndex.value;
  let tokenIndexHex = tokenIndexIn.toString(16); 

  const singleTokenAmount = document.getElementById('singleTokenAmount');
  let tokenAmountIn = singleTokenAmount.value;

  // this is ALWAYS scaled by 1e18 because here, we are dealing with LP tokens specifically
  const amountInHex = (tokenAmountIn * 1e+18).toString(16);
  const amountInPadded = amountInHex.padStart(64, '0');
  const indexInPadded = tokenIndexHex.padStart(64, '0');

  transactionData = 
    '0x3e3a1560'        // function signature
    + amountInPadded    // amount LP in
    + indexInPadded     // token index
    + minAmountPadded   // min out
    + deadline6ca33f73Padded;
  
  const transactionParams = activePool.getTransactionParams(transactionData);

  await ethRequest(transactionParams, statusElement, loggingKeyword);
  button.disabled = false;
}


async function claimRewards(button) {
  button.disabled = true;
  const loggingKeyword = 'Claim Rewards';
  statusElement = document.getElementById('getRewardsStatus');
  showAttempting(statusElement, loggingKeyword);

  const rewardClaimMessageData = '0xc00007b00000000000000000000000001d7216e115f8884016004e3f390d824f0cec4afc';
  const transactionParams = activePool.getRewardsTransactionParams(rewardClaimMessageData);

  ethRequest(transactionParams, statusElement, loggingKeyword);
  button.disabled = false;
}
