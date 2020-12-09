import { gql, useSubscription } from "@apollo/client";
import React from "react";

const GET_MESSAGES = gql`
	subscription {
		messages {
			id,
			user
			content
		}
	}
`;

const Messages = ({ user }) => {
	const { data } = useSubscription(GET_MESSAGES);

	console.log(data);

	if (!data) {
		return null;
	}

	return (
		<>
			{data.messages.map(({ id, user: messageUser, content }) => {
				const isFromMe = user === messageUser;
				return (
					<div
						key={id}
						style={{
							display: "flex",
							fontFamily: "Commic Sans MS",
							justifyContent: isFromMe
								? "flex-end"
								: "flex-start",
							padding: "1em",
						}}
					>
						{!isFromMe && (
							<div
								title={messageUser}
								style={{
									height: 40,
									width: 40,
									marginRight: "0.5em",
									border: "2px solid #e5e6ea",
									borderRadius: 20,
									textAlign: "center",
									fontSize: "18pt",
								}}
							>
								{messageUser.slice(0, 2).toUpperCase()}
							</div>
						)}
						<div
							style={{
								background: isFromMe ? "#4caf50" : "#e1e1e1",
								color: isFromMe ? "white" : "black",
								padding: "0.5em 1em",
								borderRadius: 5,
								maxWidth: "60%",
							}}
						>
							{content}
						</div>
					</div>
				);
			})}
		</>
	);
};

export default Messages;
