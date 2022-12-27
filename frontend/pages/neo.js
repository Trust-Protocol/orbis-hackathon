import { Button } from '@nextui-org/react';
import { useEffect, useState } from 'react';
import neo4j from 'neo4j-driver';
import { Orbis } from '@orbisclub/orbis-sdk';
import { Table, useAsyncList } from "@nextui-org/react";
// Initialize orbis
const orbisSDK = new Orbis();

// Create a neo4j driver instance, also needs to be synchronus
function startNeo() {
	try {

		// Set currently to LyghtCode's neo instance. TODO add to env variables
		const driver = neo4j.driver(
			'neo4j+s://7b86ca55.databases.neo4j.io', // Replace with the bolt URI of your Neo4j instance
			neo4j.auth.basic('neo4j', process.env.NEO4J_PASSWORD) // Replace with your Neo4j username and password
		);

		// Create and set session
		const session = driver.session();
		setNeo(session);

	} catch (error) {
		console.log(error);
	}


};


export default function Neo() {

	// Create neosession in state
	const [neoSession, setNeo] = useState();
	const [orbisData, setData] = useState([]);
	const [neoData, setFinalData] = useState();
	const [orbisObj, setOrbisObj] = useState({});



	useEffect(() => {
		// Self-explanatory :D
		// startNeo()

		// Verify session is set
		// console.log("Current neo4j session: ");
		// console.log(neoSession);

	}, [])

	const columns = [
		{ name: "User", uid: "username" },
		{ name: "DID", uid: "did" },
		// { name: "Address", uid: "address" },
		// { name: "Address", uid: "address" },
	];

	// StartDB, synchronus function -.-
	function startDB() {
		// Self-explanatory :D
		startNeo();

		// Verify session is set
		console.log("Current neo4j session: ");
		console.log(neoSession);
	};




	// Pull data from OrbisSDK API - Play with calls here
	async function pullData() {

		// Create a neo4j driver instance
		const driver = neo4j.driver(
			'neo4j+s://0f01d659.databases.neo4j.io:7687', // Cloud instance
			neo4j.auth.basic('neo4j', "L7PiDxQB32Lxid8tk3lsQsB3pbmiy2r-0B1QJZCrJAo") // Replace with your Neo4j username and password
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


				// query = `
				// 	CREATE (a:Address {address: $from})
				// 	FOREACH (b IN $following |
				// 	  MERGE (a)-[r:FOLLOWS]->(:Address {address: b})
				// 	)
				// `
				// const params = {
				// 	from: item.address,
				// 	following: ['Node B', 'Node C', 'Node D']
				// }
        		

        		// // Execute the query
        		// try {
            	// 	const result = await session.run(query, params);
            	// 	//console.log("Successful: ", result);
        		// } catch(err) {
				// 	console.log("Error item: ", item)
            	// 	console.log("Err: ", err);
        		// }

			}
			

			// set Data for table
			// setData(data);
			// console.log('first user is ' + orbisData[0].username);

			// //set obj for send
			// const orbisRes = await orbisData.reduce((acc, curr) => {
			// 	acc[curr.did] = curr;
			// 	return acc;
			//   }, {});
			// setOrbisObj(orbisRes);
			// console.log(orbisObj);



		} catch (error) {
			console.log(error)
		}


	};


	// Create a User node with DID use UNWIND instead of complex FOREACH - LyghtCode
	function addUsers(tx, dids) {
		return tx.run(`UNWIND ${dids} AS map CREATE (n) SET n = map`)
	};

	// Organize,Remove,Edit the Data Structure from Orbis here
	async function handleData() {

		try {

			// Set currently to LyghtCode's neo instance. TODO add to env variables
			const driver = neo4j.driver(
				'neo4j+s://7b86ca55.databases.neo4j.io', // Replace with the bolt URI of your Neo4j instance
				neo4j.auth.basic('neo4j', process.env.NEXT_PUBLIC_NEO4J_PASSWORD) // Replace with your Neo4j username and password
			);


			// Verify Connect
			try {
				await driver.getServerInfo();
				console.log('Driver created');
			} catch (error) {
				console.log(`connectivity verification failed. ${error}`);
			}

			// Create and set session
			const session = driver.session();

			// Use UNWIND instead of for each because query will be very large with real data
			const result = await session.run('UNWIND $orbisObj AS orb CREATE (p:PERSON {id: orb.did})', {orbisObj: orbisData});

			console.log(result);





		} catch (error) {
			console.log(error);

		}

	};

	// Send Data to Neo Instance
	async function sendData() {

		try {

			for (const address of finalArray) {

				try {
					// TODO: query Orbis SDK for each following of user

					for (const element of data["data"]) {
						// Define a Cypher query to create a new relationship type
						// TODO: do we need something other than eventID?
						const query = `
		                MERGE (a:Address {address: $from})
		                MERGE (b:Passport {id: $id})
		                MERGE (a)-[:OWNS]->(b)
		            `;
						const params = {
							from: address,
							id: element["event"]["id"],
						}
						await session.run(query, params);
					}
				} catch (err) {
					console.log(err);
				}
			}

		} catch (error) {

		}


	};

	return (
		<>
			<main className="h-screen text-3xl font-bold bg-gray-300">
				<div className="sticky flex justify-center top-10">
					<div className="xl">
						<div className="relative flex items-end w-full mb-4">
							<Button rounded ghost shadow color="gradient" auto
								onClick={pullData}

							>Pull Data</Button>
							{/* <Button rounded ghost shadow color="secondary" auto
								onPress={startDB}
							>StartNeoDB</Button> */}
						</div>
						<Table
							striped
							lined
							compact
							bordered
							shadow={true}
							aria-label="Dynamic content & infinity pagination"
							css={{ minWidth: "100%", height: "auto" }}
						// color=""
						>
							<Table.Header columns={columns}>
								{(column) => (
									<Table.Column maxWidth={'33px'} key={column.uid}>{column.name}</Table.Column>
								)}
							</Table.Header>
							<Table.Body
								items={orbisData}
							// loadingState={list.loadingState}
							// onLoadMore={list.loadMore}
							>
								{(item) => (
									<Table.Row key={item['did']}>
										{(key) => <Table.Cell>{item[key]}</Table.Cell>}
									</Table.Row>
								)}
							</Table.Body>
							<Table.Pagination
								shadow
								noMargin
								align="center"
								rowsPerPage={10}
								onPageChange={(page) => console.log({ page })}
							/>
						</Table>
						<Button rounded ghost shadow color="success" auto
							onClick={handleData}
						>Send Data to Neo</Button>
					</div>
				</div>
			</main>
		</>
	)
}
