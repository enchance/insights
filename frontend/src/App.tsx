import {useState} from 'react'
import '@assets/css/styles.css';
import {Button} from '@ui/button.tsx';
import {RouterProvider} from 'react-router-dom';
import routes from '@core/routes.tsx';



function App() {
  return (
    <RouterProvider router={routes} />
  )
}

export default App
