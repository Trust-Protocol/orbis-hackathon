const { PassportReader } = require("@gitcoinco/passport-sdk-reader");
const { PassportScorer } = require("@gitcoinco/passport-sdk-scorer");

async function main() {
    // create a new instance pointing at Gitcoins mainnet Ceramic node
    const reader = new PassportReader("https://ceramic.passport-iam.gitcoin.co", "1");

    const scorer = new PassportScorer([
        {
            provider: "BrightID",
            issuer: "did:key:z6MkghvGHLobLEdj1bgRLhS4LPGJAvbMA1tn2zcRyqmYU5LC",
            score: 0.5
        },
        {
            provider: "Twitter",
            issuer: "did:key:z6MkghvGHLobLEdj1bgRLhS4LPGJAvbMA1tn2zcRyqmYU5LC",
            score: 0.1
        },
        {
            provider: "Lens",
            issuer: "did:key:z6MkghvGHLobLEdj1bgRLhS4LPGJAvbMA1tn2zcRyqmYU5LC",
            score: 0.2
        },
        {
            provider: "Discord",
            issuer: "did:key:z6MkghvGHLobLEdj1bgRLhS4LPGJAvbMA1tn2zcRyqmYU5LC",
            score: 0.1
        },
        {
            provider: "POAP",
            issuer: "did:key:z6MkghvGHLobLEdj1bgRLhS4LPGJAvbMA1tn2zcRyqmYU5LC",
            score: 0.1
        },
    ]);

    // read a Passport for any Ethereum Address
    const passport = await reader.getPassport("0x2741dB011195D3400bf2466734A5Fc143f3144f8");

    // for (const item of passport.stamps) {
    //     console.log(item.credential)
    // }

    console.log("Scoring: ", await scorer.getScore("0x2741dB011195D3400bf2466734A5Fc143f3144f8"));
    
}

main();