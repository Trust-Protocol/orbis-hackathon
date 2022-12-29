import "./App.css"
import { useState } from "react"
import Graph from "react-vis-network-graph"
import neo4j from "neo4j-driver"
import "./App.css"

function App() {
	const [address, setAddress] = useState("")
	const [nodes, setNodes] = useState([])
	const [edges, setEdges] = useState([])
	const [nodeData, setNodeData] = useState({})

	async function callDB() {
		// Create a neo4j driver instance
		const driver = neo4j.driver(
			"neo4j+s://0f01d659.databases.neo4j.io:7687", // Cloud instance
			neo4j.auth.basic(
				"neo4j",
				"L7PiDxQB32Lxid8tk3lsQsB3pbmiy2r-0B1QJZCrJAo",
			),
		)

		// Create a session
		const session = driver.session()

		// Define a Cypher query to create a new relationship type
		const query = `
			MATCH (a:Address {address: "${address}"})-[r]-(b)
			RETURN a,r,b
			UNION
			MATCH (a)-[r]->(b:Address {address: "${address}"})
			RETURN a,r,b
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
					properties: record._fields[0].properties,
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
					properties: record._fields[2].properties,
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
			length: 50,
		},
		nodes: {
			color: "#A32",
		},
		height: "800px",
		interaction: {
			hover: true,
		},
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

	const events = {
		select: ({ nodes, edges }) => {
			showData(nodes)
		},
		hoverNode: ({ nodes }) => {
			showData(nodes)
		},
	}

	function showData(node) {
		nodes.forEach(e => {
			if (e.id === node) {
				setNodeData({
					address: e.properties.address,
					eigenScore: e.properties.eigentrustScore,
				})
			}
		})
	}

	return (
		<div className="App">
			<div className="search">
				<input
					type="text"
					className="searchTerm"
					placeholder="Address"
					onInput={e => setAddress(e.target.value)}
				/>
				<button
					type="submit"
					onClick={() => {
						address === ""
							? alert("Address input is empty")
							: callDB()
					}}
					className="searchButton"
				>
					<svg
						aria-hidden="true"
						focusable="false"
						data-prefix="fas"
						data-icon="search"
						className="w-4"
						role="img"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 512 512"
					>
						<path
							fill="currentColor"
							d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"
						></path>
					</svg>
				</button>
			</div>

			{edges.length > 0 ? (
				<Graph graph={graph} options={options} events={events} />
			) : (
					<>search an address to get visualize it <br />
					example : 0xc834b86b4c4bb10681b3284a59f5c0240aed3510</>
			)}

			<div className="display-info">
				<p id="address">Address : {nodeData.address}</p>
				<p id="connections">Eigen Score : {nodeData.eigenScore}</p>
			</div>
		</div>
	)
}

export default App

// example : 0xc834b86b4c4bb10681b3284a59f5c0240aed3510
