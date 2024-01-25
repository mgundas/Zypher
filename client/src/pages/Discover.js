import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { useConfig } from "../contexts/ConfigContext"
import { useSelector } from "react-redux"
import { Profile } from '../components/home/discover/Profile'

export const Discover = () => {
  const config = useConfig()
  const { accessToken } = useSelector(state => state.auth)

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)



  const fetchRandomUsers = useCallback(async (size) => {
    setLoading(true)
    try {
      const params = {
        headers: {
          Authorization: `${accessToken}`
        },
        params: {
          size: size
        }
      }
      const response = await axios.get(`${config.apiUri}/discover`, params)
      setUsers(response.data)

    } catch (err) {
      if (process.env.NODE_ENV === "development") console.log(err.message)
    } finally {
      setLoading(false)
    }
  }, [accessToken, config.apiUri])

  useEffect(() => {
    fetchRandomUsers(30)
    return () => {

    }
  }, [fetchRandomUsers])

  return (
    <div className='flex flex-1 gap-4 px-4 flex-col items-center pt-4 overflow-auto'>
      <div className='grid grid-cols-3 sm:grid-cols-6 gap-3'>
        <div className='col-span-3 sm:col-span-6'>
          <div className='flex justify-between items-center'>
            <div className='grid'>
              <h1 className='text-md font-bold'>Isn't it high time we discover new people? Let's go!</h1>
              <p className='text-sm'>Here are top picks for you.</p>
            </div>
            <button onClick={() => { fetchRandomUsers(30) }} className='btn btn-sm btn-circle btn-primary text-white'><i className="bi text-2xl h-2 w-2 flex items-center justify-center bi-arrow-clockwise"></i></button>
          </div>
        </div>
        {loading ? (
          <div>
            <span className="loading loading-spinner loading-lg text-info"></span>
          </div>) : users.map((user, index) => {
            return (
              <Profile user={user} key={index} />
            )
          })}
      </div>
    </div>
  )
}
