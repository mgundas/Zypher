import React from 'react'
import { setLocale } from '../../../redux/reducers/languageSlicer';
import { useSelector, useDispatch } from'react-redux';

export const LanguageButton = () => {
   const dispatch = useDispatch()
   const { translation, availableLangs } = useSelector(state => state.translation)

   return (
      <div className="dropdown dropdown-start md:dropdown-end hidden sm:block">
         <button tabIndex={0} className="btn btn-ghost btn-circle">
            <i className="bi bi-translate text-lg"></i>
         </button>
         <div
            tabIndex={0}
            className="dropdown-content z-[1] card card-compact w-44 p-2 shadow bg-rtca-800 rounded-t-none"
         >
            <div className="p-1 grid gap-2">
               <h3 className="text-center text-md font-medium">{translation.content.navbar.languages}</h3>
               <div className="overflow-y-auto overflow-x-hidden grid gap-1 max-h-[calc(100vh/2)]">
                  {[...availableLangs].map((lang, index) => {
                     return (
                        <button onClick={() => { dispatch(setLocale(lang[1][0])) }} className="btn btn-outline btn-accent" key={index}>{lang[1][1]}</button>
                     )
                  })}
               </div>
            </div>
         </div>
      </div>
   )
}
