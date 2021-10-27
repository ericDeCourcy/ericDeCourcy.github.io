/* global tokens */

class Pool {
    constructor(address, rewardsContractAddress, poolTokens, LPToken) {
        this.address = address;
        this.rewardsContractAddress = rewardsContractAddress;
        this.poolTokens = poolTokens;
        this.LPToken = LPToken;
    }

    async getTokenApprovalHTML() {
        let buttonsHTML = '';
        let allTokensAreApproved = true;

        const tokenAllowanceTransactionData =
            '0xdd62ed3e'
            + ''.padStart(24, '0')
            + ethereum.selectedAddress.slice(2,)
            + ''.padStart(24, '0')
            + activePool.address.replace(/^0x/, '');

        const allTokens = JSON.parse(JSON.stringify(this.poolTokens));
        allTokens.push(this.LPToken);
        for (const token of allTokens) {
            let disabled = '';
            let status = '';
            try {
                const allowance = await ethereum.request({
                    method: 'eth_call',
                    params: [{
                        to: token.address,
                        data: tokenAllowanceTransactionData
                    }]
                });
                if (allowance != 0) {
                    disabled = 'disabled';
                    status = 'Token already approved.';
                } else {
                    allTokensAreApproved = false;
                }
            } catch(error) {
                console.log(error);
                allTokensAreApproved = false;
            }
            buttonsHTML += `<button id="approve${token.name}Button" 
                onclick="approveToken(this, ${token.id})" ${disabled}>
                    Approve ${token.name}
                </button>
                <span id="approve${token.name}Status" class="status">${status}</span>
                <br/>`;
        }
        if (allTokensAreApproved) {
            return null;
        } else {
            return buttonsHTML;
        }
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

const usd1Pool = new Pool(
    '0x3E192A2Eae22B3DB07a0039E10bCe29097E881B9', // swap pool address
    '0xFc99135BAEa5D21267b2c26E3d8518aaf07f2644', // rewards contact
    [tokens[0], tokens[1], tokens[2]],
    tokens[3]
);
