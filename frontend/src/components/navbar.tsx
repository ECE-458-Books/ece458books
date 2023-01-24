import React from 'react';
import {  Link } from "react-router-dom";

const Navbar= () =>{
  return (
  <div>
    <li>
      <Link to="/books">Books</Link>
    </li>
    <li>
      <Link to="/genres">Genres</Link>
    </li>
  </div>
  );
}
export default Navbar;