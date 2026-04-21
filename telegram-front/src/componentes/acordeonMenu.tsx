import React from 'react';
import { Box, Typography, IconButton, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { ExpandMore, SubdirectoryArrowRight } from '@mui/icons-material';

interface AcordeonMenuProps {
  titulos: Record<string, { titulo: string; temas: { id: number; titulo: string }[] }>;
  desplegar: string | false;
  escucharCambios: (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
  editar: (panel: string) => void;
  redirigir: (path: string) => void;
  eliminar: (panel: string) => void;
}

const AcordeonMenu: React.FC<AcordeonMenuProps> = ({ titulos, desplegar, escucharCambios, editar, redirigir, eliminar }) => {


  return (
    <Box sx={{ width: "100%", maxWidth: "100%", overflow: "auto" }}>

      {Object.keys(titulos).map(panel =>
        (

          <Box key={panel} sx={{ mb: 0, border: 'none' }}>

            <Accordion expanded={desplegar === panel} onChange={escucharCambios(panel)}>
              <AccordionSummary
                expandIcon={<ExpandMore sx={{ width: "40px" }} />}
                aria-controls={`panel-${panel}-content`}
                id={`panel-${panel}-header`}
                sx={{ cursor: "pointer", padding: "0px" }}
              >
                <Typography
                  color="var(--color1)"
                  sx={{
                    width: "100%",
                    lineBreak: "anywhere",
                    display: "flex",
                    alignItems: "center",
                    fontFamily: "var(--font-secundary)",
                    fontWeight: "500",

                  }}
                >
                  {titulos[panel].titulo}
                </Typography>
                <Box minWidth={"120px"} >
                  <IconButton
                    aria-label="edit"
                    onClick={(event) => {
                      event.stopPropagation();
                      editar(panel);
                    }}
                  >
                    <EditIcon sx={{ color: "var(--color1)" }} />
                  </IconButton>
                  <IconButton
                    aria-label="VerTemas"
                    onClick={(event) => {
                      event.stopPropagation();
                      redirigir(`/menu/temas/${panel}`);
                    }}
                  >
                    <AddIcon sx={{ color: "var(--color2)" }} />
                  </IconButton>
                  <IconButton
                    aria-label="eliminar"
                    onClick={(event) => {
                      event.stopPropagation();
                      eliminar(panel);
                    }}
                  >
                    <DeleteIcon sx={{ color: "var(--color5)" }} />
                  </IconButton>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ padding: "0px" }}>
                <Box sx={{ width: "80%", overflowWrap: "anywhere", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {titulos[panel].temas.length === 0 ? (
                    <Typography color="var(--color3)">No hay temas asociados.</Typography>
                  ) : (
                    <Typography component="ul" sx={{ paddingLeft: 2, display: "grid", gap: "10px" }}>
                      {titulos[panel].temas.map(tema => (
                        <Typography key={tema.id} component="li" display="flex" color="var(--color3)" fontFamily="var(--font-secundary)">
                          <SubdirectoryArrowRight fontSize='small' sx={{ color: "var(--color3)" }} /> {tema.titulo}
                        </Typography>
                      ))}
                    </Typography>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          </Box>
        )
     )}
    </Box>
  );
};

export default AcordeonMenu;
