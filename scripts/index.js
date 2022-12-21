const neo4j = require("neo4j-driver");
require('dotenv').config()

async function main() {

    // Initialize orbis
    const { Orbis } = await import('@orbisclub/orbis-sdk');
    let orbis = new Orbis();
    import('node-fetch');

    // Define array based on Orbis SDK copy/pasted from telegram
    let array;
    // let { data, error, status } = await orbis.api.from("orbis_v_profiles").select().ilike('address', '0x599759f1F068fA830876FC230Ec236DCe5db7F18');
    let { data, error, status } = await orbis.api.from("orbis_v_profiles").select().range(0, 100);
    console.log(data);

    // fetch(url).then((resp) => resp.json()).then(function(data) {
    // console.log(data);

    //     }


    // Create a neo4j driver instance
    // const driver = neo4j.driver(
    //     'neo4j+s://7b86ca55.databases.neo4j.io', // Replace with the bolt URI of your Neo4j instance
    //     neo4j.auth.basic('neo4j', process.env.NEO4J_PASSWORD) // Replace with your Neo4j username and password
    // );

    // Create a session
    // const session = driver.session();

    // TODO: build a graph
    // for (const address of array) {

    //     try {
    //         // TODO: query Orbis SDK for each following of user

    //         for (const element of data["data"]) {
    //             // Define a Cypher query to create a new relationship type
    //             // TODO: do we need something other than eventID?
    //             const query = `
    //                 MERGE (a:Address {address: $from})
    //                 MERGE (b:Passport {id: $id})
    //                 MERGE (a)-[:OWNS]->(b)
    //             `;
    //             const params = {
    //                 from: address,
    //                 id: element["event"]["id"],
    //             }
    //             await session.run(query, params);
    //         }
    //     } catch (err) {
    //         console.log(err);
    //     }
    // }
}

main();