import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import LogoutButton from "./components/LogoutButton";

export default async function Home() {
  // Fetch the session on the server
  const session = await getServerSession(authOptions);

  return (
    <div className="content-container">
      <h1 style={{fontSize: '4rem', fontWeight: 'bold'}}>you login</h1>
      
      {/* Display the username from the session */}
      <p style={{marginTop: '20px'}}>Welcome back {session?.user?.name}.</p>
      
      {/* Use the client-side logout button component */}
      <LogoutButton />
    </div>
  );
}
