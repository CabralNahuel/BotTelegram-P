import { Box } from '@mui/material';
import { useEffect, useState, useMemo } from 'react';
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Cell } from 'recharts';

type Estadistica = {
  id: number;
  idmenu: number;
  texto: string;
  tema_menu: string;
  visualizaciones: number;
};

type Props = {
  estadisticas: Estadistica[];
  selectedMenu: number | null;
};

const GraficosN: React.FC<Props> = ({ estadisticas, selectedMenu }) => {
  const [temas, setTemas] = useState<Estadistica[]>([]);

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

  const updatedTemas = useMemo(() => {
    return temas.map((estadistica) => ({
      ...estadistica,
      key: `${estadistica.id}-${Math.random().toString(36).substr(2, 9)}`
    }));
  }, [temas]);

  return (
    <Box display="flex" justifyContent="center">
      {selectedMenu === null ? (
        <ResponsiveContainer className="chart-container">
          <ComposedChart
            data={estadisticas.filter(item => item.tema_menu === 'menu')}
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
              {estadisticas.filter(item => item.tema_menu === 'menu').map((estadistica) => (
                <Cell
                  key={`${estadistica.id}-${Math.random().toString(36).substr(2, 9)}`}
                  fill={estadistica.id % 2 === 0 ? "#00aec3" : "#d3d3d3"}
                  height={10}
                />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      ) : (
        updatedTemas.length === 0 ? (
          <Box textAlign="center" marginTop="2rem">
            <p className='TipografiaEstadisticaVacia'>No se han registrado visualizaciones para los Temas de este Menú aún.</p>
          </Box>
        ) : (
          <ResponsiveContainer className="chart-container">
            <ComposedChart
              layout="centric"
              data={updatedTemas}
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
                {updatedTemas.map((estadistica) => (
                  <Cell
                    key={estadistica.key} // Utiliza la nueva clave generada
                    fill={estadistica.id % 2 === 0 ? "#00aec3" : "#d3d3d3"}
                    height={10}
                  />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        )
      )}
    </Box>
  );
};

export default GraficosN;
