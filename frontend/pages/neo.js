import { Button } from '@nextui-org/react';
import { useEffect, useState } from 'react';
import neo4j from 'neo4j-driver';
import { Orbis } from '@orbisclub/orbis-sdk';
import { Table, useAsyncList } from "@nextui-org/react";
import { PassportScorer } from "@gitcoinco/passport-sdk-scorer";

// Initialize orbis
const orbisSDK = new Orbis();


export default function Neo() {

	// Create neosession in state
	const [neoSession, setNeo] = useState();
	const [orbisData, setData] = useState([]);




	const columns = [
		{ name: "User", uid: "username" },
		{ name: "DID", uid: "did" },
		// { name: "Address", uid: "address" },
	];




	// Pull data from OrbisSDK API - Play with calls here
	async function pullData() {

		// Create a neo4j driver instance
		const driver = neo4j.driver(
			'neo4j+s://7b86ca55.databases.neo4j.io', // Replace with the bolt URI of your Neo4j instance
			neo4j.auth.basic('neo4j', process.env.NEXT_PUBLIC_NEO4J_PASSWORD) // Replace with your Neo4j username and password
		);

		// Create a session
		const session = driver.session();

		// Instantiate PassportScorer
		const scorer = new PassportScorer([
			{
				provider: "Github",
				issuer: "did:key:z6MkghvGHLobLEdj1bgRLhS4LPGJAvbMA1tn2zcRyqmYU5LC",
				score: 0.5
			}
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
									<Table.Column maxwidth={'33px'} key={column.uid}>{column.name}</Table.Column>
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
						{/* <Button rounded ghost shadow color="success" auto
							onClick={handleData}
						>Send Data to Neo</Button> */}
					</div>
				</div>
			</main>
		</>
	)
}
