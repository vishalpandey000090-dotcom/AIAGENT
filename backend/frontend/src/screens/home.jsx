import React, { useContext } from "react";
import { UserContext } from "../context/user.context";

const Home = () => {
  const { user } = useContext(UserContext);

  return (
    <main className='p-4'>
      <div className='project'>
        <div className="project"></div>
      </div>

    </main>
  );
};
export default Home;
