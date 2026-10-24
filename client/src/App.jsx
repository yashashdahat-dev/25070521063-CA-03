import About from './about';
import Home from './home';
import { Routes,Route } from 'react-router-dom';
import Services from './services';
import Contact from './contact';
import Nav from './nav';

const App = () => {

  return (

    <>

      <Nav/>
    
      <Routes>

        <Route path = "/" element = {<Home/>}></Route>
        <Route path = "/about" element = {<About/>}></Route>
        <Route path = "/services" element = {<Services/>}></Route>
        <Route path = "/contact" element = {<Contact/>}></Route>

      </Routes>
    
    </>
  )
}

export default App;