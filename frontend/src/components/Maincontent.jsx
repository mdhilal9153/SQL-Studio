import React from 'react'
import Questions from './Questions'

const Maincontent = () => {
  return (
    <div className='container'>
        <div className='maincontent'>
            <h1 className='heading'>Master SQL with real world challenges</h1>

            <p className='sub-head'>Sharpen your database skills through hands-on practice with curated SQL problems designed for all skill levels</p>
    
        </div>
      
      <Questions/>
    </div>

    
  )
}

export default Maincontent
