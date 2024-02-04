import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { useConfig } from '../contexts/ConfigContext'
import { DevInfo } from '../components/landing/DevInfo'
import { useSelector } from 'react-redux';
import { useLoading } from '../contexts/LoadingContext';

export const Changelog = () => {
   const config = useConfig()
   const { translation } = useSelector(state => state.translation)
   const { setVisible } = useLoading()

   const [changelog, setChangelog] = useState([]);

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

         if (response) {
            setChangelog(response.data.changelog)
            console.log(response.data)
         } else {
            setChangelog([{
               title: "No changelog found",
               commitCode: "x.x.x",
               description: "No changelog found"
            }])
            if (process.env.NODE_ENV === "development") console.error(`An error occured while fetching changelog data.`);
         }
      } catch (err) {
         if (process.env.NODE_ENV === "development") console.error(`An error occured while fetching changelog data. ${err.message}`);
      } finally {
         setVisible(false)
      }
   }, [config.apiUri, setVisible])

   useEffect(() => {
      fetchChangelog()
   }, [fetchChangelog])

   return (
      <div className='flex h-screen'>
         <div className="hero flex-1 overflow-auto">
            <div className="hero-overlay bg-opacity-60" style={{ backgroundImage: "url(/landing-bg.png)" }}></div>
            <div className='hero-content flex-col'>
               <h1 className="my-5 text-3xl font-bold text-center">{`${translation.content.title} ${translation.content.changelog.changelog}`}</h1>
               <div className="text-center text-neutral-content">
                  <div className="max-w-2xl">
                     <ul className="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical">
                        {changelog.map((changelog, index) => {
                           return index % 2 === 0 ? (
                              <li key={index}>
                                 <div className="timeline-middle">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                                 </div>
                                 <div className="timeline-start text-start md:text-end mb-10">
                                    <time className="font-mono italic">v{changelog.commitCode}</time>
                                    <div className="text-lg font-black">{changelog.title}</div>
                                    {changelog.desc}
                                 </div>
                                 <hr />
                              </li>
                           ) : (
                              <li key={index}>
                                 <hr />
                                 <div className="timeline-middle">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                                 </div>
                                 <div className="timeline-end text-start mb-10">
                                    <time className="font-mono italic">v{changelog.commitCode}</time>
                                    <div className="text-lg font-black">{changelog.title}</div>
                                    {changelog.desc}                              </div>
                                 <hr />
                              </li>
                           )
                        })}
                     </ul>
                     <p className='text-lg font-black mt-5'>And many more...</p>
                  </div>
               </div>
               <DevInfo />

            </div>
         </div>
      </div>
   )
}
