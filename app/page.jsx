import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import LogoutButton from "@/app/components/LogoutButton";

export default async function Home() {
  // Fetch the session on the server
  const session = await getServerSession(authOptions);
  
  // Safely get the name, or default to "User" if something goes wrong
  const username = session?.user?.name || "User";

  return (
    <div className="content-container">
      <h1 style={{fontSize: '4rem', fontWeight: 'bold'}}>you login</h1>
      
      {/* This paragraph now shows the dynamic username */}
      <p style={{marginTop: '20px', fontSize: '1.5rem'}}>
        Hello, <span style={{color: '#0070f3', fontWeight: 'bold'}}>{username}</span>
      </p>
      
      <p style={{marginTop: '10px'}}>Welcome to your private dashboard.</p>
      
      {/* We use the separate client component for the button */}
      <LogoutButton />
    </div>
  );
}
