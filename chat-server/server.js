const express = require("express");
const http = require("http");
const { ApolloServer, gql, PubSub } = require("apollo-server-express");

const messages = [];

const typeDefs = gql`
	type Message {
		id: ID!
		user: String!
		content: String!
	}

	type User {
		name: String!,
		age: Int!
	}

	type Query {
		messages: [Message!],
		users: [User!]!
	}

	type Mutation {
		postMessage(user: String!, content: String!): ID!
	}

	type Subscription {
		messages: [Message!]
	}
`;

const subscribers = [];
const onMessagesUpdate = (handler) => {
	subscribers.push(handler);
};

const resolvers = {
	Query: {
		messages: () => messages,
		users: () => ([
			{
				name: "Tri",
				age: 24
			},
			{
				name: "Tera",
				age: 28
			}
		])
	},

	Mutation: {
		postMessage: (parent, { user, content }) => {
			const id = messages.length;
			messages.push({
				id,
				user,
				content,
			});
			subscribers.forEach((fn) => fn());
			return id;
		},
	},

	Subscription: {
		messages: {
			subscribe: (parent, args, { pubsub }) => {
				const channel = Math.random().toString(36).slice(2, 15);

				onMessagesUpdate(() => pubsub.publish(channel, { messages }));
				setTimeout(() => pubsub.publish(channel, { messages }), 0);

				return pubsub.asyncIterator(channel);
			},
		},
	},
};

const pubsub = new PubSub();

const server = new ApolloServer({
	typeDefs,
	resolvers,
	context: { pubsub },
	subscriptions: {
		onConnect: () => console.log("Connected to websocket"),
	},
});

const app = express();
const subPath = "/graphql";
server.applyMiddleware({ app, path: subPath });

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

const port = 4000;
httpServer.listen({ port }, () => {
	console.log(
		`Server ready at http://localhost:${port}${server.graphqlPath}`
	);
	console.log(
		`Subscriptions ready at ws://localhost:${port}${server.subscriptionsPath}`
	);
});
