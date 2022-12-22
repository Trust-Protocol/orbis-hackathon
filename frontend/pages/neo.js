import { Button } from '@nextui-org/react';
import { useEffect, useState } from 'react';
import neo4j from 'neo4j-driver';
import { Orbis } from '@orbisclub/orbis-sdk';
import { Table, useAsyncList } from "@nextui-org/react";
// Initialize orbis
const orbisSDK = new Orbis();


export default function Neo() {

	// Create neosession in state
	const [neoSession, setNeo] = useState();
	const [orbisData, setData] = useState([]);
	const [neoData, setFinalData] = useState();

	

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
	}


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


	}

	// Pull data from OrbisSDK API - Play with calls here
	async function pullData() {

		try {

			// let { data, error, status } = await orbis.api.from("orbis_v_profiles").select().ilike('address', '0x599759f1F068fA830876FC230Ec236DCe5db7F18');
			let { data, error, status } = await orbisSDK.api.from("orbis_v_profiles").select().range(0, 10);
			console.log(data);

			// set 
			setData(data);
			console.log('first user is ' + orbisData[0].username);


		} catch (error) {


		}


	};

	// Organize,Remove,Edit the Data Structure from Orbis here
	async function handleData() {

		try {



		} catch (error) {

		}

	}

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
								onPress={pullData}
							>Pull Data</Button>
							<Button rounded ghost shadow color="secondary" auto
								onPress={startDB}
							>StartNeoDB</Button>
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
								onPress={sendData}
							>Send Data to Neo</Button>
					</div>
				</div>
			</main>
		</>
	)
}
