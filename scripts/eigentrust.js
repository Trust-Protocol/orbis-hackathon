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
    let score;
    const result = await session.writeTransaction(tx =>
        tx.run(query).then(result => {
            const records = result.records;
            records.forEach(record => {
                // Get the node from the record
                const node = record.get(0);

                // Add a new property to the node
                //node.properties.eigentrustScore = '1';

                // Save the updated node back to the database
                const updateQuery = `
                    MATCH (n)
                    WHERE id(n) = ${node.identity.toNumber()}
                    SET n.eigentrustScore = 1
                    RETURN n
                `;
                tx.run(updateQuery);
                //tx.run(updateQuery, {props: node.properties});
            });
        })
    );

    // Close the session and driver
    session.close();
    driver.close();
}

updateNodes();
