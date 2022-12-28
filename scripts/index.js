const { Orbis } = require("@orbisclub/orbis-sdk");
const neo4j = require("neo4j-driver");
require('dotenv').config()

async function main() {

    // Initialize orbis
    const orbisSDK = new Orbis();

    // Create a neo4j driver instance
    const driver = neo4j.driver(
        'neo4j+s://0f01d659.databases.neo4j.io:7687', // Cloud instance
        neo4j.auth.basic('neo4j', process.env.NEO4J_CLOUD_PASSWORD) // Replace with your Neo4j username and password
    );

    // Create a session
    const session = driver.session();

    try {
        let { data, error, status } = await orbisSDK.api.from("orbis_v_profiles").select().range(0, 99);
        console.log(data);

        let addresses = [];
        let query, params;
        for (const item of data) {
            console.log("Start of item: ", item)

            addresses = [];

            try {
                addresses.push(item.address);
                const followingAddresses = await orbisSDK.getProfileFollowing(item.did);
                for (const element of followingAddresses.data) {
                    addresses.push(element.details.metadata.address)
                }

                query = `
                    FOREACH (x IN $addresses |
                        MERGE (a:Address {address: x})
                      )
                `
                params = {
                    addresses: addresses
                }
                await session.run(query, params);
            } catch(err) {
                console.log("Error item: ", item)
                console.log("Err: ", err);
            }

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
                } catch(err) {
                    console.log("Error item: ", item)
                    console.log("Err: ", err);
                }
            }
        }
    } catch (error) {
        console.log(error)
    }
};

main();