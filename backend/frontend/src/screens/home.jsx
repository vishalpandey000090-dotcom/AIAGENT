import React, { useContext } from 'react';
import { UserContext } from '../context/user.context'
import { json } from 'express';

const Home = () => {
 const {user}= UserContext(UserContext)
  return <div>{JSON.stringfy(user)}</div>;
}
export default Home;
