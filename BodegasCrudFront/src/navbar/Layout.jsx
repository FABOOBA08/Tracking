import React from 'react';
import Navbar from './navbar'; // Importa la barra de navegación

const Layout = ({ children }) => { // `children` será el contenido renderizado por el componente hijo
  return (
    <div>
      <Navbar /> {/* La barra de navegación estará presente en todas las páginas */}
      <div className="content"> {/* Sección para el contenido */}
        {children}
      </div>
    </div>
  );
};

export default Layout;
