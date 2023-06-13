import { useAtom } from "jotai"
import { globalSubmittedUsername } from "./store"
import UsernameEnterPage from "./pages/username-enter-page";
import RacingPage from "./pages/racing-page";

function App() {
  const [submittedUsername]  = useAtom(globalSubmittedUsername);
  if(submittedUsername) {
    return <RacingPage />
  }
  return <UsernameEnterPage />
}

export default App
