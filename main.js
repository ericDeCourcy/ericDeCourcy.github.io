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

  if (sectionNumber === 0) {
    updateDepositButton();
  } else if (sectionNumber === 1) {
    updateSwapButton();
  } else if (sectionNumber === 2) {
    updateWithdrawalButtons();
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
  updateWithdrawalButtons();
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

function showSubmitted(statusElement, loggingKeyword) {
  const message = `${loggingKeyword} submitted...`;
  console.log(message);
  statusElement.innerHTML = message;
}

function showSuccess(statusElement, loggingKeyword) {
  const message = `${loggingKeyword} successful!`;
  console.log(message);
  statusElement.innerHTML = message;
}

function showError(statusElement, loggingKeyword, error) {
  if (typeof error.code !== 'undefined') {
    console.error(`${loggingKeyword} failed: ${error.code} ${error.message}`);
  } else {
    console.error(`${loggingKeyword} failed: ${error.message}`);
  }
  statusElement.innerHTML = `${loggingKeyword} failed. See console log for details.`;
}


function showConnectionTab() {
  tabs.connection.hidden = false;
  tabs.actions.hidden = true;
}

async function pollForStatus(txHash) {
  const waitTime = 1000;
  let totalTimeWaited = 0;

  while (totalTimeWaited < 30000) {
      try {
          let txInfo = await ethereum.request({
              method: 'eth_getTransactionReceipt',
              params: [txHash]
          });
          if (txInfo == null) {
              await new Promise(resolve => setTimeout(resolve, waitTime));
              totalTimeWaited += waitTime;
          } else {
              if (txInfo.status === '0x1') {
                  return true;
              } else if (txInfo.status === '0x0') {
                  return false;
              } else {
                  console.warn(`Unexpected transaction status ${txInfo.status}.`);
                  return false;
              }
          }
      } catch (e) {
          console.error(`pollForStatus('${txHash}') failed: ${e.code}: ${e.message}`);
          return false;
      }
  }
}


async function ethRequest(params, statusElement, loggingKeyword) {
  try {
    const txHash = await ethereum.request({
      method: 'eth_sendTransaction',
      params: [params],
    });
    showSubmitted(statusElement, loggingKeyword);
    const success = await pollForStatus(txHash);
    if (success) {
      showSuccess(statusElement, loggingKeyword);
      return true;
    } else {
      throw new Error('Transaction reverted or blockchain polling timed out.');
    }
  } catch (error) {
    showError(statusElement, loggingKeyword, error);
    return false;
  }
}

async function connectToMetamask(button) {
  button.disabled = true;
  const loggingKeyword = 'Metamask connection';
  const statusElement = document.getElementById('transactionStatus');
  showAttempting(statusElement, loggingKeyword);

  try {
    // ensure the user has Metamask and connect to it
    if (!ethereum) {
      throw new ReferenceError('Could not access Metamask browser extension.');
    }
    accounts = await ethereum.request({ method: 'eth_requestAccounts' });

    // try to switch to the Fuse chain
    try {
      showAttempting(statusElement, 'switch to Fuse chain');
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x7a' }],
      });
    } catch (switchError) {
      // if we couldn't switch because it doesn't exist, try to add it
      if (switchError.code === 4902) {
        console.log(`Fuse chain was not found on your Metamask extension.`);
        showAttempting(statusElement, 'add Fuse chain to Metamask');
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x7a',
              chainName: 'Fuse',
              nativeCurrency: {
                name: 'Fuse',
                symbol: 'FUSE',
                decimals: 18,
              },
              rpcUrls: ['https://rpc.fuse.io'],
              blockExplorerUrls: ['https://explorer.fuse.io/']
            }],
          });
        } catch (addError) {
          throw new ReferenceError('Failed to add Fuse chain to Metamask.');
        }
      } else { // if we couldn't switch for another reason, just fail out
        throw new ReferenceError('Failed to switch Metamask to Fuse chain.');
      }
    }
    showSuccess(statusElement, loggingKeyword);
    await showActionsTab();
  } catch (error) {
    showError(statusElement, loggingKeyword, error);
  } finally {
    button.disabled = false;
  }
}

async function approveToken(button, tokenIndex, statusElement) {
  button.disabled = true;
  const token = activePool.getTokenByIndex(tokenIndex);
  const loggingKeyword = token.name + ' approval';
  showAttempting(statusElement, loggingKeyword);
  
  const transactionData = 
    '0x095ea7b3'                                                    // function signature
    + activePool.address.replace(/^0x/, '').padStart(64, '0')       // fake swap address
    + ''.padStart(64, 'f');                                         // max amount
  const transactionParams = activePool.getTransactionParams(transactionData);
  transactionParams['to'] = token.address;
  transactionParams['gas'] = '0x0186A0';
  
  const success = await ethRequest(transactionParams, statusElement, loggingKeyword);
  if (success) {
    await checkTokenApproval(token);
    updateDepositButton();
    updateSwapButton();
    updateWithdrawalButtons();
  } else {
    button.disabled = false;
  }
}

async function rejectToken(tokenIndex) {
  const token = activePool.getTokenByIndex(tokenIndex);
  const transactionData =
    '0x095ea7b3'                                                    // function signature
    + activePool.address.replace(/^0x/, '').padStart(64, '0')       // fake swap address
    + ''.padStart(64, '0');                                         // max amount
  const transactionParams = activePool.getTransactionParams(transactionData);
  transactionParams['to'] = token.address;
  transactionParams['gas'] = '0x0186A0';

  await ethRequest(transactionParams, document.createElement('div'), 'Token rejection');
  await checkAllTokensForApproval();
  updateDepositButton();
  updateSwapButton();
  updateWithdrawalButtons();
}

async function showActionsTab() {
  showLoadingStyle();
  tabs.connection.hidden = true;
  tabs.actions.hidden = false;
  await checkAllTokensForApproval();
  populateActionOptions();
  updateSwapButton();
  hideLoadingStyle();
}


async function checkAllTokensForApproval() {
  for (const token of activePool.allTokens) {
    await checkTokenApproval(token);
  }
}

async function checkTokenApproval(token) {
  const tokenAllowanceTransactionData =
    '0xdd62ed3e'
    + ''.padStart(24, '0')
    + ethereum.selectedAddress.slice(2,)
    + ''.padStart(24, '0')
    + activePool.address.replace(/^0x/, '');
  const allowance = await ethereum.request({
    method: 'eth_call',
    params: [{
        to: token.address,
        data: tokenAllowanceTransactionData
    }]
  });
  token.approved = (allowance != 0) ? true : false;
  console.log(`Setting token approval info: ${token.name}: ${token.approved}`);
}


function showLoadingStyle() {
  const loadingOverlay = document.getElementById('loadingOverlay');
  loadingOverlay.hidden = false;
  document.body.style.cursor = 'wait';
}

function hideLoadingStyle() {
  const loadingOverlay = document.getElementById('loadingOverlay');
  loadingOverlay.hidden = true;
  document.body.style.cursor = 'default';
}


async function changeActivePool(value) {
  showLoadingStyle();
  activePool = pools[value];
  await checkAllTokensForApproval();
  updateSwapButton();
  hideLoadingStyle();
  displayLPBalance();
  displayUserBalance();
  populateActionOptions();
  hideLoadingStyle();
}


function populateActionOptions() {
  document.getElementById('poolOptions').innerHTML = getPoolOptionsHTML();

  document.getElementById('swapForm').innerHTML =
    `<label for="swapAmountIn">Tokens in for swap:</label>`
    + `<input type="number" id="swapAmountIn" name="swapAmountIn" oninput="calculateSwap()" min="0" value="0"/>`
    + activePool.getSelectTokenHTML('Token you will send in:', 'swapTokenIndexIn', true)
    + activePool.getSelectTokenHTML('Token you will receive:', 'swapTokenIndexOut');
    updateSwapOutOptions();

  const indexOutElement = document.getElementById('swapTokenIndexOut');
  const indexInElement = document.getElementById('swapTokenIndexIn');
  indexInElement.addEventListener('change', updateSwapButton);
  [indexInElement, indexOutElement].forEach((element) => {
    element.addEventListener('change', displayUserBalance);
    element.addEventListener('change', calculateSwap);
  });

  document.getElementById('singleWithdrawalForm').innerHTML =
    activePool.getSelectTokenHTML('Withdrawal Token:', 'singleTokenIndex')
    + `<label for="singleTokenAmount">Amount Of LP Token To Withdraw:</label>`
    + `<input type="number" id="singleTokenAmount" name="singleTokenAmount" min="0" value="0"/>`;
  
  document.getElementById('depositForm').innerHTML =
    activePool.getInputTokenAmountHTML('to deposit:', 'ToDeposit', 'updateDepositButton()');

  document.getElementById('imbalancedWithdrawalForm').innerHTML =
    activePool.getInputTokenAmountHTML('desired:', 'ImbalancedOut');
}


function getNewMajorButton(id, text, onclick) {
  const buttonElement = document.createElement('button');
  buttonElement.id = id;
  buttonElement.classList.add('majorButton');
  buttonElement.innerHTML = text;
  buttonElement.addEventListener('click', onclick);
  return buttonElement;
}


function updateDepositButton() {
  const wrapper = document.getElementById('depositButtonWrapper');
  const buttonElement = document.getElementById('depositButton');
  buttonElement.disabled = true;

  let newButtonElement;
  let approvalNeeded = false;
  for(const token of activePool.poolTokens) {
    const elementName = `${token.name}ToDeposit`;
    const elementValue = Number(document.getElementById(elementName).value);

    if (elementValue > 0 && token.approved === false) {
      newButtonElement = getNewMajorButton('depositButton', `Approve ${token.name}`,
        (() => approveToken(newButtonElement, token.index, document.getElementById('depositStatus')))
      );
      approvalNeeded = true;
      break;
    }
  }
  if (!approvalNeeded) {
    newButtonElement = getNewMajorButton('depositButton', 'Deposit', (() => deposit(newButtonElement)));
  }
  wrapper.replaceChild(newButtonElement, buttonElement);
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


async function displayUserBalance() {
  const swapTokenIndexIn = document.getElementById('swapTokenIndexIn');
  const userBalance = document.getElementById('userBalance');

  let tokenIndexIn = swapTokenIndexIn.value;

  const balanceQueryTxData =
    '0x70a08231'
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

    userBalance.innerHTML = `Your current balance: ${tokenBalance} ${activePool.poolTokens[tokenIndexIn].name}`;
  
  } catch (error) {
    console.log(`Error retreiving user balance: ${error.code} ${error.message}`);
  }

}

async function displayLPBalance() {
    const LPTokenBalanceElement = document.getElementById('LPTokenBalance');
    const loadingString = 'Getting LP Balance...';
    LPTokenBalanceElement.innerHTML = loadingString;
    console.log(loadingString);

    const encodedBalanceTx =
      '0x70a08231'
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


function updateSwapButton() {
  const wrapper = document.getElementById('swapButtonWrapper');
  const buttonElement = document.getElementById('swapButton');
  buttonElement.disabled = true;

  const tokenInIndex = document.getElementById('swapTokenIndexIn').value;
  const tokenIn = activePool.getTokenByIndex(tokenInIndex);

  let newButtonElement;
  if (tokenIn.approved) {
    newButtonElement = getNewMajorButton('swapButton', 'Swap', (() => swap(newButtonElement)));
  } else {
    newButtonElement = getNewMajorButton('swapButton', `Approve ${tokenIn.name}`,
      (() => approveToken(newButtonElement, tokenIn.index, document.getElementById('swapStatus')))
    );
  }
  wrapper.replaceChild(newButtonElement, buttonElement);
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

function updateSwapOutOptions() {
  const tokenIndexIn = document.getElementById('swapTokenIndexIn');
  const tokenIndexOut = document.getElementById('swapTokenIndexOut');

  const inVal = tokenIndexIn.value;
  const outVal = tokenIndexOut.value;

  for (const option of tokenIndexOut.options) {
    option.selected = false;
    option.disabled = (option.value == inVal) ? true : false;
  }

  if (inVal != outVal) {
    tokenIndexOut.options[outVal].selected = true;
  } else {
    if (inVal == 0) {
      tokenIndexOut.options[1].selected = true;
    } else {
      tokenIndexOut.options[0].selected = true;
    }
  }
}

async function calculateSwap() {
  const swapValueIn = document.getElementById('swapAmountIn').value;
  const tokenIndexIn = document.getElementById('swapTokenIndexIn').value;
  const tokenIndexOut = document.getElementById('swapTokenIndexOut').value;
  const swapEstimateElement = document.getElementById('swapEstimate');
  swapEstimateElement.innerHTML = `Estimating swap outcome...`;

  let swapAmountScaled = swapValueIn * activePool.poolTokens[tokenIndexIn].decimals;
  
  const transactionData = 
    '0xa95b089f'    // calculate swap sighash
    + getPaddedHex(tokenIndexIn) 
    + getPaddedHex(tokenIndexOut) 
    + getPaddedHex(swapAmountScaled);

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


function updateWithdrawalButtons() {
  buttons = [
    {
      id: 'withdrawBalancedButton',
      wrapper: document.getElementById('withdrawBalancedButtonWrapper'),
      element: document.getElementById('withdrawBalancedButton'),
      status: document.getElementById('withdrawBalancedStatus'),
      clickEvent: withdrawBalanced,
      text: 'Balanced Withdrawal'
    },
    {
      id: 'withdrawImbalancedButton',
      wrapper: document.getElementById('withdrawImbalancedButtonWrapper'),
      element: document.getElementById('withdrawImbalancedButton'),
      status: document.getElementById('withdrawImbalancedStatus'),
      clickEvent: withdrawImbalanced,
      text: 'Imbalanced Withdrawal'
    },
    {
      id: 'withdrawSingleButton',
      wrapper: document.getElementById('withdrawSingleButtonWrapper'),
      element: document.getElementById('withdrawSingleButton'),
      status: document.getElementById('singleWithdrawStatus'),
      clickEvent: withdrawSingleToken,
      text: 'Withdraw Single Token'
    }
  ];
  buttons.forEach((button) => {
    button.element.disabled = true;
    let newButtonElement;
    if (activePool.LPToken.approved) {
      newButtonElement = getNewMajorButton(button.id, button.text, 
        (() => button.clickEvent(newButtonElement))
      );
    } else {
      newButtonElement = getNewMajorButton(button.id, `Approve ${activePool.LPToken.name}`,
        (() => approveToken(newButtonElement, activePool.LPToken.index, button.status))
      );
    }
    button.wrapper.replaceChild(newButtonElement, button.element);
  });
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
