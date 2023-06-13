import { Input, Button } from "../components";
import { useAtom } from "jotai";
import { globalSubmittedUsername, globalUsername } from "../store";
import { useState } from "react";

function UsernameEnterPage() {
	const [username, setUsername] = useAtom(globalUsername);
	const [errorText, setErrorText] = useState("");
	const [_, setSubmittedUsername] = useAtom(globalSubmittedUsername);
	return (
		<form className="flex flex-col gap-3 w-64"
onSubmit={(e) => {
	e.preventDefault();
	        	if(username.length<3) {
	        		setErrorText("Must enter a name with >=3 characters");
	        		return;
	        	}
	        	setSubmittedUsername(true);
	        }}
		>
	        <Input value={username} placeholder="Put a username here" onChange={(ev) => {
	          setUsername(ev.target.value);
	        }} />
	        <Button type="submit">Play 🎮</Button>
	        <p className="text-red-500">{errorText}</p>
		</form>
	)
}

export default UsernameEnterPage;