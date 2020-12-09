import React, { useState } from "react";
import { ApolloProvider, gql, useMutation } from "@apollo/client";
import { Container, Row, Col, FormInput, Button } from "shards-react";
import { client } from "./client/ApolloClient";
import Messages from "./Messages";

const SEND_MESSAGE = gql`
	mutation($user: String!, $content: String!) {
		postMessage(user: $user, content: $content)
	}
`;

const Chat = () => {
	const [user, setUser] = useState("");
	const [content, setContent] = useState("");
	const [sendMessage] = useMutation(SEND_MESSAGE);

	const handleChangeUser = (event) => {
		setUser(event.target.value);
	};

	const handleChangeContent = (event) => {
		setContent(event.target.value);
	};

	const onSendMessage = () => {
		if (user.length > 0 && content.length > 0) {
			sendMessage({
				variables: {
					user,
					content,
				},
			});
			setContent("");
		}
	};

	const handleOnKeyUpContent = (event) => {
		if (event.keyCode === 13) {
			onSendMessage();
		}
	};

	return (
		<Container>
			<Messages user={user} />
			<Row>
				{/* @ts-ignore */}
				<Col xs={2}>
					<FormInput
						label="User"
						value={user}
						onChange={handleChangeUser}
					/>
				</Col>
				{/* @ts-ignore */}
				<Col xs={8}>
					<FormInput
						label="Content"
						value={content}
						onChange={handleChangeContent}
						onKeyUp={handleOnKeyUpContent}
					/>
				</Col>
				{/* @ts-ignore */}
				<Col xs={2}>
					<Button onClick={onSendMessage}>Send</Button>
				</Col>
			</Row>
		</Container>
	);
};

export default () => {
	return (
		<ApolloProvider client={client}>
			<Chat />
		</ApolloProvider>
	);
};
