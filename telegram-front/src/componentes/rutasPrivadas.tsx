import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../assets/store.redux'; 

const ProtejerRutas: React.FC = () => {
  const usuario = useSelector((state: RootState) => state.usuario.usuario); 


  return usuario ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtejerRutas;
