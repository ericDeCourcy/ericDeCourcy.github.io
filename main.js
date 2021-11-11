/* global pools, getPoolOptionsHTML */
let activePool = pools.USD1;

function getPoolOptionsHTML() {
  let optionsHTML = '';
  Object.keys(pools).forEach((poolName) => {
    let selected = (activePool === pools[poolName]) ? 'selected' : '';
    optionsHTML += `<option value="${poolName}" ${selected}>${poolName} Pool</option>\n`;
  });
  return `<form id="poolForm">
      <label for="selectPool">Current Pool: </label>
      <select id="selectPool" name="selectPool" onchange="changeActivePool(value)">
        ${optionsHTML}
      </select>
  </form>`;
}

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

  if (sectionNumber === 2) { 
    displayLPBalance();
  }

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
    displayLPBalance();
  }
}


function getPaddedHex(input) {
  return input.toString(16).padStart(64, '0');
}

function getTokenArrayLengthPadded() {
  return getPaddedHex(activePool.poolTokens.length);
}

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

function showConnectionTab() {
  tabs.connection.hidden = false;
  tabs.approval.hidden = true;
  tabs.actions.hidden = true;
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
    await showApprovalTab();
  } catch (error) {
    showError(statusElement, loggingKeyword, error);
  } finally {
    button.disabled = false;
  }
}

async function showApprovalTab() {
  tabs.connection.hidden = true;
  tabs.approval.hidden = false;
  tabs.actions.hidden = true;
  const tokenApprovalButtons = document.getElementById('tokenApprovalButtons');
  tokenApprovalButtons.innerHTML = 'Loading token approval data...';
  const tokenApprovalHTML = await activePool.getTokenApprovalHTML();
  if (tokenApprovalHTML == null) {
    showActionsTab();
  } else {
    tokenApprovalButtons.innerHTML = tokenApprovalHTML;
  }
}

//TODO alanna simplify this function
async function approveToken(button, tokenIndex) {
  button.disabled = true;
  const token = activePool.allTokens.filter((token) => token.index === tokenIndex)[0];
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


function showActionsTab() {
  tabs.connection.hidden = true;
  tabs.approval.hidden = true;
  tabs.actions.hidden = false;
  populateActionOptions();
}

function changeActivePool(value) {
  activePool = pools[value];
  displayLPBalance();
  displayUserBalance();
  showApprovalTab();
}

function populateActionOptions() {
  document.getElementById('poolOptions').innerHTML = getPoolOptionsHTML();

  document.getElementById('swapForm').innerHTML =
    `<label for="swapAmountIn">Tokens in for swap:</label>`
    + `<input type="number" id="swapAmountIn" name="swapAmountIn" oninput="calculateSwap(value)" min="0" value="0"/>`
    + activePool.getSelectTokenHTML('Token for swap input:', 'swapTokenIndexIn')
    + activePool.getSelectTokenHTML('Token for swap output:', 'swapTokenIndexOut');
    const indexInElement = document.getElementById('swapTokenIndexIn');
    indexInElement.addEventListener("change", displayUserBalance);
    const indexOutElement = document.getElementById('swapTokenIndexOut');
    indexOutElement.addEventListener("change", displayUserBalance);

  document.getElementById('singleWithdrawalForm').innerHTML =
    activePool.getSelectTokenHTML('Withdrawal Token:', 'singleTokenIndex')
    + `<label for="singleTokenAmount">Amount Of LP Token To Withdraw:</label>`
    + `<input type="number" id="singleTokenAmount" name="singleTokenAmount" min="0" value="0"/>`;
  
  document.getElementById('depositForm').innerHTML =
    activePool.getInputTokenAmountHTML('to deposit:', 'ToDeposit');

  document.getElementById('imbalancedWithdrawalForm').innerHTML =
    activePool.getInputTokenAmountHTML('desired:', 'ImbalancedOut');
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
    + getTokenArrayLengthPadded()
    + activePool.getTokenValuesFromElements('ToDeposit');

  //approves Fake USDC for transfer into the stableswap frontend
  const transactionParams = activePool.getTransactionParams(transactionData);

  await ethRequest(transactionParams, statusElement, loggingKeyword);
  button.disabled = false;
}


async function displayLPBalance() {
    const LPTokenBalanceElement = document.getElementById('LPTokenBalance');
    const loadingString = 'Getting LP Balance...';
    LPTokenBalanceElement.innerHTML = loadingString;
    console.log(loadingString);

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
    
    const tokenBalanceString = `Your LP Token balance: ${parseInt(LPBalance, 16) / 1e+18}`;
    LPTokenBalanceElement.innerHTML = tokenBalanceString;
    console.log(tokenBalanceString);
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


async function calculateSwap(value) {
  const swapTokenIndexIn = document.getElementById('swapTokenIndexIn');
  const swapTokenIndexOut = document.getElementById('swapTokenIndexOut');
  const swapEstimateElement = document.getElementById('swapEstimate');
  swapEstimateElement.innerHTML = `Estimating swap outcome...`;

  let tokenIndexIn = swapTokenIndexIn.value;
  let tokenIndexOut = swapTokenIndexOut.value;

  let swapAmountScaled = value * activePool.poolTokens[tokenIndexIn].decimals;
  
  const transactionData = 
    '0xa95b089f'    // calculate swap sighash
    + getPaddedHex(tokenIndexIn) 
    + getPaddedHex(tokenIndexOut) 
    + getPaddedHex(swapAmountScaled);

  console.log("got to before the try in calc swap");
  console.log("transactionData = " + transactionData);

  try {
    let swapEstimateOutput = await ethereum.request({
      method: 'eth_call',
      params:  [{
        to: activePool.address,
        data: transactionData  
      }]
    }); 
    console.log(`Raw swap estimate: ${swapEstimateOutput}.`);  // TODO: add to debug toggle
    
    const swapEstimateOutputDescaled = parseInt(swapEstimateOutput) / activePool.poolTokens[tokenIndexOut].decimals;  // TODO: will this impart inaccuracies?
    const roundedSwapEstimate = Math.round(swapEstimateOutputDescaled * 100) / 100;

    swapEstimateElement.innerHTML = `Estimated swap outcome: ${roundedSwapEstimate} ${activePool.poolTokens[tokenIndexOut].name}`;

  } catch (error) {
    console.log(`Error retreiving swap estimate: ${error.code} ${error.message}`);
  }
}

async function displayUserBalance() {
  const swapTokenIndexIn = document.getElementById('swapTokenIndexIn');
  const userBalance = document.getElementById('userBalance');

  let tokenIndexIn = swapTokenIndexIn.value;

  let funcSig = '0x70a08231';

  let balanceQueryTxData = funcSig 
    + ''.padStart(24, '0') 
    + ethereum.selectedAddress.slice(2,);


  try {
    let rawUserBalance = await ethereum.request({
      method: 'eth_call',
      params:   [{
        to: activePool.poolTokens[tokenIndexIn].address,
        data: balanceQueryTxData
      }]
    });
    console.log(`Raw balance retrieved: ${rawUserBalance}.`);  //TODO add debug toggle
  
    //format this to correct num of decimals
    const tokenBalance = parseInt(rawUserBalance, 16) / activePool.poolTokens[tokenIndexIn].decimals;

    // display it
    userBalance.innerHTML = `Your current balance: ${tokenBalance} ${activePool.poolTokens[tokenIndexIn].name}`;
  
  } catch (error) {
    console.log(`Error retreiving user balance: ${error.code} ${error.message}`);
  }

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
    + getTokenArrayLengthPadded()
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
    + getTokenArrayLengthPadded()
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
