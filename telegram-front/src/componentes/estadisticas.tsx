import { Box, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Cell } from 'recharts';
import { v4 as uuidv4 } from 'uuid';
import { apiFetch } from '../api/client';





type Estadistica = {
  id: number;
  idmenu: number;
  texto: string;
  tema_menu: string;
  visualizaciones: number;
}; 



export default function EstadisticaN() {
  const [estadisticas, setEstadisticas] = useState<Estadistica[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<number | null>(null);
  const [temas, setTemas] = useState<Estadistica[]>([]);

  useEffect(() => {
    const obtenerEstadisticas = async () => {
      try {
        const respuesta = await apiFetch('/estadisticas/', {
          method: 'GET',
        });

        if (!respuesta.ok) {
          throw new Error(`HTTP error! Status: ${respuesta.status}`);
        }

        const data = await respuesta.json();

        if (data && data.length > 0) {
          const rows = data as Omit<Estadistica, 'id'>[];
          const dataConId = rows.map((item, index) => ({
            ...item,
            id: index,
          }));
          setEstadisticas(dataConId);
        } else {
          console.warn('No se encontraron datos en la respuesta del backend');
        }
      } catch (error) {
        console.error('Error al obtener la cantidad de datos:', error);
      }
    };

    obtenerEstadisticas();
  }, []);

  useEffect(() => {
    if (selectedMenu !== null) {
      const temasDelMenu = estadisticas.filter(
        item => item.tema_menu === 'tema' && item.idmenu === selectedMenu
      );
      setTemas(temasDelMenu);
    } else {
      setTemas([]);
    }
  }, [selectedMenu, estadisticas]);

  const handleMenuClick = (menuId:number) => {
    setSelectedMenu(menuId);
  };

  const obtenerMenus = () => {
    return estadisticas.filter(item => item.tema_menu === 'menu');
  };

  return (
    <Box className="estadistica" marginTop="2rem" width="20rem">
      <Box
        display="flex"
        flexWrap="wrap"
        justifyContent="center"
        gap="3px"
        marginBottom="1rem"
     
      >
        <Button
          key={uuidv4()}
          variant="outlined"
          onClick={() => setSelectedMenu(null)}
          style={{
            width: 'auto',
            backgroundColor: selectedMenu === null ? '#00aec3' : 'white',
            color: selectedMenu === null ? 'white' : '#00aec3',
            border:"solid 1px #00aec3"
          }}
          onMouseOver={(e) => {
            if (selectedMenu !== null) e.currentTarget.style.backgroundColor = '#e0f7ff';
          }}
          onMouseOut={(e) => {
            if (selectedMenu !== null) e.currentTarget.style.backgroundColor = 'white';
          }}
        >
          Menús
        </Button>
        {obtenerMenus().map(menu => (
          <Button
            variant="outlined"
            key={uuidv4()}
            onClick={() => handleMenuClick(menu.idmenu)}
            style={{
              width: 'auto',
              backgroundColor: selectedMenu === menu.idmenu ? '#00aec3' : 'white',
              color: selectedMenu === menu.idmenu ? 'white' : '#00aec3',
              border:"solid 1px #00aec3"

            }}
            onMouseOver={(e) => {
              if (selectedMenu !== menu.idmenu) e.currentTarget.style.backgroundColor = '#e0f7ff';
            }}
            onMouseOut={(e) => {
              if (selectedMenu !== menu.idmenu) e.currentTarget.style.backgroundColor = 'white';
            }}
          >
            {menu.texto}
          </Button>
        ))}
      </Box>

      {selectedMenu === null ? (
        <ResponsiveContainer className="chart-container">
          <ComposedChart
            data={obtenerMenus()}
            layout="centric"
            margin={{
              top: 28,
              right: 0,
              bottom: 10,
              left: 0,
            }}
          >
            <CartesianGrid stroke="#f5f5f5" />
            <XAxis type="number" scale={'auto'} />
            <YAxis dataKey="texto" type="category" scale="band" width={180} />
            <Tooltip />
            <Bar dataKey="visualizaciones" barSize={6} fill="#00aec3">
              {obtenerMenus().map((entry, index) => (
                <Cell
                  key={uuidv4()}
                  fill={index % 2 === 0 ? "#00aec3" : "#d3d3d3"}
                  height={10}
                  onClick={() => handleMenuClick(entry.idmenu)}
                />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      ): temas.length === 0 ? (
        <Box textAlign="center" marginTop="2rem">
          <p className='TipografiaEstadisticaVacia'>No se han registrado visualizaciones para los Temas de este Menú aún.</p>
        </Box>
      ) :  (
        <ResponsiveContainer className="chart-container">
          <ComposedChart
            layout="centric"
            data={temas}
            margin={{
              top: 28,
              right: 0,
              bottom: 10,
              left: 10,
            }}
          >
            <CartesianGrid stroke="#f5f5f5" />
            <XAxis type="number" scale={'auto'} />
            <YAxis dataKey="texto" type="category" scale="band" width={100} />
            <Tooltip />
            <Bar dataKey="visualizaciones" barSize={6} fill="#00aec3">
              {temas.map((entry, index) => (
                <Cell
                  key={uuidv4()+entry.idmenu}
                  fill={index % 2 === 0 ? "#00aec3" : "#d3d3d3"}
                  height={10}
                />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
}
