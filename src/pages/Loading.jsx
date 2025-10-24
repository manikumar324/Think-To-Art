import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

const Loading = () => {

  const navigate = useNavigate()
  const {fetchUser} = useAppContext();  //we are usinf fecthUser here because when you buy credits it's updating after page refresh to avoid that.

  useEffect(()=>{
    const timeOut = setTimeout(() => {
      fetchUser()
      //redirect to home page
      navigate("/")
    },8000)
    return () => clearTimeout(timeOut) 
  },[])
  return (
    <div className='bg-gradient-to-b from-[#531B81] to-[#29184B] 
    backdrop-opacity-60 flex items-center justify-center h-screen w-screen text-white text-2xl'>
      <div className='w-10 h-10 rounded-full border-3 border-white border-t-transparent animate-spin'>

      </div>
    </div>
  )
}

export default Loading;