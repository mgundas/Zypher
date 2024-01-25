import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { useConfig } from "../contexts/ConfigContext"
import { useSelector } from "react-redux"
import { getInitials } from "../helpers/getInitials"
import { generateRandomColor, generateAltRandomColor } from "../helpers/generateRandomColor";
import { useNavigate } from "react-router-dom"

export const Discover = () => {
  const config = useConfig()
  const navigate = useNavigate()
  const { accessToken } = useSelector(state => state.auth)

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)

  const convertTime = (time) => {
    const date = new Date(time);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Months are zero-based, so add 1
    const day = date.getDate();

    return `${year}-${month < 10 ? "0" + month : month}-${day < 10 ? "0" + day : day
      }`;
  };

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
              <div key={index}>
                <button onClick={() => document.getElementById("modal-" + user.username).showModal()} className='flex select-none h-24 w-24 rounded-xl relative shadow-lg'>
                  <div style={{
                    backgroundColor: generateRandomColor(user.username)
                  }} className="bg-indigo-700 h-24 w-24 rounded-xl flex items-center justify-center">
                    <p className='text-4xl text-white font-medium'>{getInitials(user.username)}</p>
                  </div>
                  {/* <img src='https://picsum.photos/300/300' className='h-24 w-24 rounded-xl' alt="" /> */}
                  <div className='absolute bottom-0 text-xs overflow-clip w-24 px-2 text-white bg-rtca-950/50 rounded-b-xl text-center'>@{user.username}</div>
                  <div className='absolute h-3 w-3 -right-1 -top-1 bg-green-500 rounded-full'></div>
                </button>
                <dialog id={"modal-" + user.username} className="modal modal-bottom sm:modal-middle">
                  <div className="modal-box p-0 grid select-none">
                    <div style={{ backgroundColor: generateAltRandomColor(user.username) }} className="font-bold shadow-lg text-lg p-3 h-24">
                      <div style={{
                        backgroundColor: generateRandomColor(user.username)
                      }} className="bg-indigo-700 h-24 w-24 rounded-xl flex items-center justify-center">
                        <p className='text-4xl text-white font-medium'>{getInitials(user.username)}</p>
                      </div>
                    </div>
                    <div className='p-5 grid grid-cols-1'>
                      <div className='flex justify-between items-center'>
                        <div className='flex flex-col'>
                          <p className='font-bold'>@{user.username}</p>
                          <p><span className='font-bold'>Joined at:</span> {convertTime(user.createdAt)}</p>
                        </div>
                        <button onClick={() => { navigate(`/chat/${user.username}`) }} className='btn btn-primary'>Message</button>
                      </div>
                    </div>
                  </div>
                  <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                  </form>
                </dialog>
              </div>
            )
          })}

      </div>
    </div>
  )
}
