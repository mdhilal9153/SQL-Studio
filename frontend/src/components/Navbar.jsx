import React from 'react'
import {User} from 'lucide-react'
const Navbar = () => {
  return (
    <div className='nav'>
        <h2 className='heading'>CipherSQLStudio</h2>

        <button className='profile-btn'>
            <User />
        </button>
        
      
    </div>
  )
}

export default Navbar
