const express = require("express");
const http = require("http");
const { ApolloServer, gql, PubSub } = require("apollo-server-express");

const messages = [];

const users = [
	{
		id: "1",
		firstName: "Tri",
		lastName: "Che",
		yob: 1997,
		address: {
			city: "Da Nang",
			street: "Hoang Dieu",
		},
	},
	{
		id: "2",
		firstName: "Van",
		lastName: "Vi",
		yob: 1997,
	},
];

const typeDefs = gql`
	type User {
		id: ID!
		firstName: String!
		lastName: String!
		yob: Int
		address: Address
	}

	type Message {
		id: ID!
		user: User!
		content: String!
	}

	type Address {
		city: String!
		street: String
	}

	type Query {
		messages: [Message!]
		user(id: ID!): User
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
		user: (parent, { id }) => {
			return users.find((user) =>  user.id === id);
		},
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
