const { PassportReader } = require("@gitcoinco/passport-sdk-reader");
const { PassportScorer } = require("@gitcoinco/passport-sdk-scorer");
const { Orbis } = require("@orbisclub/orbis-sdk");
const neo4j = require("neo4j-driver");
require('dotenv').config()

const orbisSDK = new Orbis();

async function main() {

    // Create a neo4j driver instance
    const driver = neo4j.driver(
        'neo4j+s://7b86ca55.databases.neo4j.io', // Replace with the bolt URI of your Neo4j instance
        neo4j.auth.basic('neo4j', process.env.CLOUD_NEO4J_PASSWORD) // Replace with your Neo4j username and password
    );

    // Create a session
    const session = driver.session();

    // Instantiate PassportScorer
    const scorer = new PassportScorer([
        {
            provider: "BrightID",
            issuer: "did:key:z6MkghvGHLobLEdj1bgRLhS4LPGJAvbMA1tn2zcRyqmYU5LC",
            score: 0.5
        },
        {
            provider: "Github",
            issuer: "did:key:z6MkghvGHLobLEdj1bgRLhS4LPGJAvbMA1tn2zcRyqmYU5LC",
            score: 0.5
        },
        {
            provider: "Twitter",
            issuer: "did:key:z6MkghvGHLobLEdj1bgRLhS4LPGJAvbMA1tn2zcRyqmYU5LC",
            score: 0.25
        },
        {
            provider: "Discord",
            issuer: "did:key:z6MkghvGHLobLEdj1bgRLhS4LPGJAvbMA1tn2zcRyqmYU5LC",
            score: 0.25
        },
        {
            provider: "POAP",
            issuer: "did:key:z6MkghvGHLobLEdj1bgRLhS4LPGJAvbMA1tn2zcRyqmYU5LC",
            score: 0.25
        },
        {
            provider: "Linkedin",
            issuer: "did:key:z6MkghvGHLobLEdj1bgRLhS4LPGJAvbMA1tn2zcRyqmYU5LC",
            score: 0.25
        },
    ]);

    try {
        let { data, error, status } = await orbisSDK.api.from("orbis_v_profiles").select().range(0, 9);
        console.log(data);

        let addresses = [];
        let query, params;
        for (const item of data) {
            console.log("Start of item: ", item)

            addresses = [];
            //Push user address to empty array and get followers for the user
            try {
                addresses.push(item.address);
                const followingAddresses = await orbisSDK.getProfileFollowing(item.did);
                for (const element of followingAddresses.data) {
                    addresses.push(element.details.metadata.address)
                }


                query = `
                    FOREACH (x IN $addresses |
                        MERGE (a:Address {address: x})
                      )`
                params = {
                    addresses: addresses
                }
                await session.run(query, params);

                console.log('Pushing array of addresses to DB');


            } catch (err) {
                console.log("Err: ", err);
            }

            // Score each address
            for (const address of addresses) {

                let score = await scorer.getScore(address);

                // Change name of a.score_provider = $score
                query = `
                    MATCH (a:Address {address: $user})
                    SET a.git_score = $score
                    `

                params = {
                    user: address,
                    score: score
                }

                try {
                    await session.run(query, params);
                    console.log('Merging score for ' + address);
                } catch (err) {
                    console.log("Error item: ", item)
                    console.log("Err: ", err);
                }

            }

            //Create Relationship
            for (const element of addresses.slice(1)) {
                query = `
                    MATCH (a:Address {address: $from}), (b:Address {address: $to})
                    MERGE (a)-[:FOLLOWS]->(b)
                    `

                params = {
                    from: item.address,
                    to: element
                }

                try {
                    await session.run(query, params);
                    console.log("Creating Relationships for: " + element);
                } catch (err) {
                    console.log("Error item: ", item)
                    console.log("Err: ", err);
                }

            }

        }
    } catch (err) {
        console.log("Err: ", err);
    }

};

main();