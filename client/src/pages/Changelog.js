import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { useConfig } from '../contexts/ConfigContext'
import { DevInfo } from '../components/landing/DevInfo'
import { useSelector } from 'react-redux';
import { useLoading } from '../contexts/LoadingContext';
import { useNavigate } from 'react-router-dom'


export const Changelog = () => {
   const config = useConfig()
   const navigate = useNavigate()
   const { translation } = useSelector(state => state.translation)
   const { setVisible } = useLoading()

   const [changelog, setChangelog] = useState([]);
   const [remaining, setRemaining] = useState(0);

   useEffect(() => {
      document.title = `${translation.content.changelog.changelog} - ${translation.content.title}`;
      return () => {
         document.title = `${translation.content.title}`;
      };
   }, [translation.content.changelog.changelog, translation.content.title]);

   const fetchChangelog = useCallback(async () => {
      try {
         setVisible(true)
         const response = await axios.get(`${config.apiUri}/changelog`)
         setRemaining(response.data.more)
         setChangelog(response.data.changelog)
      } catch (err) {
         setRemaining(0)
         setChangelog([{
            title: translation.content.changelog.whoops,
            commitCode: "0.0.0",
            desc: translation.content.changelog.noChangelog
         }])
         if (process.env.NODE_ENV === "development") console.error(`An error occured while fetching changelog data.`);
      } finally {
         setVisible(false)
      }
   }, [config.apiUri, setVisible, translation.content.changelog.noChangelog, translation.content.changelog.whoops])

   useEffect(() => {
      fetchChangelog()
   }, [fetchChangelog])

   return (
      <div className='flex h-screen'>
         <div className="hero flex-1 overflow-auto">
            <div className="hero-overlay bg-opacity-60" style={{ backgroundImage: "url(/landing-bg.png)" }}></div>
            <div className='hero-content flex-col'>
               <h1 className="sm:mt-5 text-3xl font-bold text-center">{translation.content.changelog.changelog}</h1>
               <button 
                  className="btn btn-primary"
                  onClick={() => {
                     window.history.pushState(null, '', '/changelog');
                     navigate("/")
                  }}
               >
                  Homepage
               </button>
               <div className="text-center text-neutral-content">
                  <div className="max-w-2xl">
                     <ul className="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical">
                        {changelog.map((log, index) => {
                           return index % 2 === 0 ? (
                              <li key={index}>
                                 {index === 0 ? (<></>) : (<hr />) /* if this is the latest log there shouldn't be a line above it */}
                                 <div className="timeline-middle">
                                    {log.completed ? (<i className="bi bi-check-circle-fill"></i>) : (<i className="bi bi-circle-fill"></i>)}
                                 </div>
                                 <div className="timeline-start text-start md:text-end mb-10">
                                    <time className="font-mono italic">v{log.commitCode}</time>
                                    <div className="text-lg font-black">{log.title}</div>
                                    {log.desc}
                                 </div>
                                 {index === changelog.length - 1 ? (<></>) : (<hr />) /* if this is the oldest log there shouldn't be a line below it */}
                              </li>
                           ) : (
                              <li key={index}>
                                 <hr />
                                 <div className="timeline-middle">
                                    {log.completed ? (<i className="bi bi-check-circle-fill"></i>) : (<i className="bi bi-circle-fill"></i>)}
                                 </div>
                                 <div className="timeline-end text-start mb-10">
                                    <time className="font-mono italic">v{log.commitCode}</time>
                                    <div className="text-lg font-black">{log.title}</div>
                                    {log.desc}
                                 </div>
                                 {index === changelog.length - 1 ? (<></>) : (<hr />) /* if this is the oldest log there shouldn't be a line below it */}
                              </li>
                           )
                        })}
                     </ul>
                     {remaining === 0 ? (<></>) : (<p className='text-lg font-black mt-5'>And {remaining} more...</p>)}
                  </div>
               </div>
               <DevInfo />

            </div>
         </div>
      </div>
   )
}
