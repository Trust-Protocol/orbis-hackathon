import "./App.css"
import { useState } from "react"
import Graph from "react-vis-network-graph"
import neo4j from "neo4j-driver"

function App() {
	const [nodes, setNodes] = useState([])
	const [edges, setEdges] = useState([])

	async function callDB() {
		// Create a neo4j driver instance
		const driver = neo4j.driver(
			"neo4j+s://0f01d659.databases.neo4j.io:7687", // Cloud instance
			neo4j.auth.basic(
				"neo4j",
				process.env.NEO4J_CLOUD_PASSWORD,
			),
		)

		// Create a session
		const session = driver.session()

		// Define a Cypher query to create a new relationship type
		const query = `
        MATCH (a)-[r]->(b) RETURN a,r,b
    `

		// Execute the query
		try {
			const result = await session.run(query)
			console.log("Successful: ", result)

			let allNodes = []
			let allEdges = []

			result.records.forEach(record => {
				allNodes.push({
					id: record._fields[0].elementId,
					label: record._fields[0].labels,
				})

				allEdges.push({
					from: record._fields[1].startNodeElementId,
					to: record._fields[1].endNodeElementId,
					id: record._fields[1].elementId,
					type: record._fields[1].type,
				})

				allNodes.push({
					id: record._fields[2].elementId,
					label: record._fields[2].labels,
				})
			})

			setNodes(removeDuplicate(allNodes))
			setEdges(removeDuplicate(allEdges))
		} catch (err) {
			console.log("Err: ", err)
		}

		// Close the session and driver
		session.close()
		driver.close()
	}

	const options = {
		layout: {
			hierarchical: false,
		},
		edges: {
			color: "#000000",
			smooth: {
				enabled: true,
				type: "dynamic",
			},
			length: 400,
		},
		nodes: {
			color: "#A32",
		},
		height: "500px",
	}

	function removeDuplicate(arr) {
		const uniqueList = arr.filter((item, index, self) => {
			return self.findIndex(t => t.id === item.id) === index
		})

		return uniqueList
	}

	const graph = {
		nodes,
		edges,
	}

	// record._fields.forEach(e => {
	// 	if (e.labels === ["Address"]) {
	// 		console.log(e.elementId)
	// 	}
	// })

	return (
		<>
			<button onClick={callDB}>click </button>
			{edges.length > 0 ? (
				<Graph graph={graph} options={options} />
			) : (
				<></>
			)}
		</>
	)
}

export default App
