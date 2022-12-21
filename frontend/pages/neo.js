import { Button } from '@nextui-org/react';
import { useEffect, useState } from 'react';
import neo4j from 'neo4j-driver';
import { Orbis } from '@orbisclub/orbis-sdk';




export default function Neo() {

	// Create neosession in state
	const [neoSession, setNeo] = useState();
	const [neoData, setData] = useState([]);

	// Initialize orbis
	const orbisSDK = new Orbis();

	useEffect(() => {
		// Self-explanatory :D
		startNeo()
		// Verify session is set
		console.log("Current neo4j session: ");
		console.log(neoSession);
	}, [setNeo])



	// Create a neo4j driver instance
	async function startNeo() {
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


	async function pullData() {

		try {

		// let { data, error, status } = await orbis.api.from("orbis_v_profiles").select().ilike('address', '0x599759f1F068fA830876FC230Ec236DCe5db7F18');
		let { data, error, status } = await orbisSDK.api.from("orbis_v_profiles").select().range(0, 10);
		console.log(data);

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


		} catch (error) {
			
			
		}

		
	};

	return (
		<>
			<main className="h-screen text-3xl font-bold bg-gray-300">
				<div className="sticky flex justify-center top-10">
					<div className="xl:w-96">
						<div className="relative flex items-stretch w-full mb-4">
							<Button rounded ghost shadow color="gradient" auto
							onClick={pullData}
							>Pull Data</Button>

						</div>
					</div>
				</div>
			</main>
		</>
	)
}
