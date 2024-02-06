import React from 'react'
import { setLocale } from '../../../redux/reducers/languageSlicer';
import { useSelector, useDispatch } from 'react-redux';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

export const LanguageButton = () => {
   const dispatch = useDispatch()
   const { availableLangs } = useSelector(state => state.translation)

   return (
      <div className="dropdown dropdown-start md:dropdown-end hidden sm:block">
         <button tabIndex={0} className="btn btn-ghost btn-circle">
            <i className="bi bi-translate text-lg"></i>
         </button>
         <div
            tabIndex={0}
            className="dropdown-content z-[1] card card-compact w-44 p-1 shadow bg-base-300 rounded-t-none"
         >
            <div className="p-1 grid gap-2">
               {/* <h3 className="text-center text-md font-medium">{translation.content.navbar.languages}</h3> */}
               <SimpleBar forceVisible="y" autoHide={true} className='max-h-[calc(100vh/3)]'>
                  <div className="grid gap-1">
                     {availableLangs.map((lang, index) => {
                        return (
                           <button onClick={() => {dispatch(setLocale(lang.locale))}} className="btn btn-sm btn-ghost justify-start font-medium" key={index}>{lang.language}</button>
                        )
                     })}
                  </div>
               </SimpleBar>
            </div>
         </div>
      </div>
   )
}
