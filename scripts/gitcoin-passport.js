const { PassportReader } = require("@gitcoinco/passport-sdk-reader");

async function main() {
    // create a new instance pointing at Gitcoins mainnet Ceramic node
    const reader = new PassportReader("https://ceramic.passport-iam.gitcoin.co", "1");

    // read a Passport for any Ethereum Address
    const passport = await reader.getPassport("0x2741dB011195D3400bf2466734A5Fc143f3144f8");

    for (const item of passport.stamps) {
        console.log(item.credential)
    }

    //console.log(passport);
    
}

main();