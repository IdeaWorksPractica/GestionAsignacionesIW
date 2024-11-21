import { useState, useEffect } from 'react';
import './asignaciones.css'
import { getScreenWidthMinusOffset } from '../../shared/services/title.service'
import { Spin } from 'antd';
export const Asignaciones = () => { 
  const [titleWidth, setWidth] = useState<number>();
  const [loading, setLoading] = useState(true);
  const getInfo = async () => {
    setLoading(true);
    setWidth(getScreenWidthMinusOffset());
    setLoading(false);
  };

  useEffect(() => {
    getInfo();
  }, []);
  return (
    <main>
        <section className='title-container'  style={{width:`${titleWidth}px`}}>
        <p>Asignaciones</p>
      </section>
      {
        loading ? (
          <Spin
            tip="Cargando..."
            size="large"
            style={{
              width: "100%",
              height: "100vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          />
        ) : (
          <>No hay data</>
        )
      }
    </main>
  )
}
