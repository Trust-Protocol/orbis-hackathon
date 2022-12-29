# orbis-hackathon

Content personalization is an important pillar in a social network platform to promise a good user experience. A core part of that is to filter out potential bots that create spam contents. We use the Orbis SDK to index user profiles on Orbis into a social graph data structure, powered by Neo4J graph database. Using the Gitcoin Passport SDK, we then assign a score to each of these profiles based on the verifiable credentials that they hold in their passports. Subsequently, we implement the [Eigentrust](https://eigen-books.gitbook.io/eigen-trust/) algorithm to compute a reputation score for each profile, which is dependent on the user's own Gitcoin score and the score of immediate connections in Orbis. The reputation score is an indication on the trustworthiness of a particular profile, where a higher reputation score means a lower probability of it being a bot. 

### Frontend Visualization

### Eigentrust

The Eigentrust algorithm is an iterative algorithm that assigns reputation score to each profile based on the reputation scores of immediate connections. During the first iteration, the starting reputation score of each user is its Gitcoin passport score. For example, if a user has a Gitcoin score of 1 (maximum score is 1) and follows x number of profiles, that means all the profiles that the user follows will receive a reputation score of 1/x. This process is repeated for all users and the reputation score of a user after one iteration will be the sum of all scores received by its follower. For subsequent iterations, the starting reputation score will be based on the reputation score computed from the previous iteration. The algorithm is run until users' reputation scores have converged. 

### Maintenance

The data indexing script and Eigentrust algorithm is run periodically to include new users on the Orbis platform and make sure any updates on a user's Gitcoin passport is captured. The changes are automatically feeded to the frontend. 

