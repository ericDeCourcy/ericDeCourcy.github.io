class Token {
    constructor(id, name, address, decimals) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.decimals = decimals;
    }

    scaleAndPad(value) {
        return (value * this.decimals).toString(16).padStart(64, '0');
    }
}

const tokens = [
    // TODO: Alanna - refactor to utilize ID's that are not 0-3 accross the code
    //new Token(0, 'Fake-DAI', '0xa277bc1c1612Bb327D79746475aF29F7a93e8E64', 1e+18),
    //new Token(1, 'Fake-USDC', '0x88c784FACBE88A20601A32Bd98d9Da8d59d08F92', 1e+6),
    //new Token(2, 'Fake-USDT', '0xa479351d97e997EbCb453692Ef16Ce06730bEBF4', 1e+6),
    //new Token(3, 'Fake-LP', '0x410a69Cdb3320594019Ef14A7C3Fb4Abaf6e962e', 1e+18)

    // tokens for USD1 pool
    new Token(0, 'DAI', '0x94Ba7A27c7A95863d1bdC7645AC2951E0cca06bA', 1e+18),
    new Token(1, 'USDC', '0x620fd5fa44BE6af63715Ef4E65DDFA0387aD13F5', 1e+6),
    new Token(2, 'USDT', '0xFaDbBF8Ce7D5b7041bE672561bbA99f79c532e10', 1e+6),
    new Token(3, 'USD1-LP', '0x61374FE435360A4a39b31045D1B71A9351f64B31', 1e+18),
]