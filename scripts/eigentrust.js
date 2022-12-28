const neo4j = require('neo4j-driver');

async function updateNodes() {
    // Create a neo4j driver instance
    const driver = neo4j.driver(
        'neo4j+s://0f01d659.databases.neo4j.io:7687', // Cloud instance
        neo4j.auth.basic('neo4j', 'L7PiDxQB32Lxid8tk3lsQsB3pbmiy2r-0B1QJZCrJAo') // Replace with your Neo4j username and password
    );

    // Create a session
    const session = driver.session();

    // Query to get all nodes
    const query = 'MATCH (n) RETURN n';

    // Execute the query in a transaction
    let scores = [];
    const result = await session.writeTransaction(tx =>
        tx.run(query).then(result => {
            const records = result.records;
            records.forEach(record => {
                // Get the node from the record
                const node = record.get(0);

                //console.log(node);
                const computeQuery = `
                    MATCH (a)-[r]->(b:Address {address: $address}) RETURN count(r)
                `
                tx.run(computeQuery, {address: node.properties.address}).then(count => {
                    const temp = count["records"][0]["_fields"][0]["low"];
                    scores.push(temp / (temp + 5));

                    //console.log(node.identity.toNumber());
                })
            });
        })
    );

    console.log(scores)

    for (let i=0; i<scores.length; i++) {
        // Save the updated node back to the database
        const updateQuery = `
            MATCH (n)
            WHERE id(n) = ${i}
            SET n.eigentrustScore = ${scores[i]}
            RETURN n
        `;
        await session.run(updateQuery);
    }

    // Close the session and driver
    session.close();
    driver.close();
}

updateNodes();
