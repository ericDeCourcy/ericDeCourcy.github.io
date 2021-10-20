/* global tokens */

class Pool {
    constructor(address, rewardsContractAddress, poolTokens, LPToken) {
        this.address = address;
        this.rewardsContractAddress = rewardsContractAddress;
        this.poolTokens = poolTokens;
        this.LPToken = LPToken;
    }

    getTokenApprovalHTML() {
        let buttonsHTML = '';

        const allTokens = JSON.parse(JSON.stringify(this.poolTokens));
        allTokens.push(this.LPToken);
        allTokens.forEach(token => {
            buttonsHTML += `<button id="approve${token.name}Button" 
                onclick="approveToken(this, ${token.id})">
                    Approve ${token.name}
                </button>
                <span id="approve${token.name}Status" class="status"></span>
                <br/>`;
        });
        return buttonsHTML;
    }

    getSelectTokenHTML(labelText, elementName) {
        let optionsHTML = '';
        this.poolTokens.forEach((token) => {
            optionsHTML += `<option value=${token.id}>
                    ${token.name}
                </option>`;
        });
        return `<label for="${elementName}">${labelText}</label>
            <select id="${elementName}" name="${elementName}">
                ${optionsHTML}
            </select>`;
    }

    getInputTokenAmountHTML(labelText, partialElementName) {
        let inputHTML = '';
        this.poolTokens.forEach((token) => {
            const elementName = token.name + partialElementName;
            inputHTML += `<label for="${elementName}">${token.name} ${labelText}</label>
                <input id="${elementName}" name="${elementName}" type="number" min="0" value="0" />`;
        });
        return inputHTML;
    }

    getTokenValuesFromElements(partialElementName) {
        // TODO alanna - l2code
        let tokenValues = '';
        activePool.poolTokens.forEach((token) => {
            const elementName = token.name + partialElementName;
            const elementValue = document.getElementById(elementName).value;
            tokenValues += token.scaleAndPad(elementValue);
        });
        return tokenValues;
    }

    getTransactionParams(transactionData) {
        return {
          nonce: '0x00',
          gasPrice: '0x3B9ACA00', // gasPrice is 1 Gwei. customizable by user during MetaMask confirmation.
          gas: '0x0F4240', // customizable by user during MetaMask confirmation.
          to: this.address, // fake swap address
          from: ethereum.selectedAddress,
          value: '0x00', // Only required to send ether to the recipient from the initiating external account.
          data: transactionData,
          chainId: '0x7a', // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
        }
    }

    getRewardsTransactionParams(transactionData) {
        const transactionParams = this.getTransactionParams(transactionData);
        transactionParams['to'] = this.rewardsContractAddress;
        return transactionParams;
    }
}

const fakePool = new Pool(
    // TODO eric verify this is the pool address. called 'fake swap address' in main.
    '0x3E192A2Eae22B3DB07a0039E10bCe29097E881B9', // swap pool address
    // TODO eric verify this is the rewards contract address.
    '0xFc99135BAEa5D21267b2c26E3d8518aaf07f2644', // rewards contact
    [tokens[0], tokens[1], tokens[2]],
    tokens[3]
);