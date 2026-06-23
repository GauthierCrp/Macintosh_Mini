import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const ApplePaint = ({ bgTheme }) => {
  const pathRef = useRef(null);
  const [viewBox, setViewBox] = useState("0 0 300 150"); 

  const classicMacHello = "m 31.853846,77.795861 c -0.0077,11.70618 -1.757614,25.961839 -3.086358,37.266319 -0.370975,3.15612 -0.592672,5.04602 1.546096,5.58137 1.68816,0.42255 3.28866,-1.1719 4.469925,-2.3975 2.399813,-2.48987 9.290916,-11.22616 14.329515,-7.96468 7.279156,4.7118 -2.559832,29.94373 11.905771,28.06018 4.162693,-0.54202 7.224975,-3.45116 9.181559,-5.9756 1.520182,-1.96138 2.905835,-2.81082 4.581194,-4.88958 3.494073,-4.33536 9.723175,-16.82467 3.936919,-21.19484 -4.101053,-3.09739 -9.456483,1.29776 -10.730572,5.00001 -2.943127,8.55214 -1.290597,15.88186 2.212459,19.98339 m 26.464491,-9.18156 c -5.132684,-6.06446 -4.389473,-19.4938 -2.61461,-32.945589 0.641012,-4.85828 4.882894,-15.52778 11.183985,-9.59829 7.61889,7.16956 1.09204,27.659059 -3.05011,35.522689 -1.89116,3.59027 -4.343814,5.42443 -5.504678,7.60963 -2.059166,3.87616 -1.502954,5.56805 -4.875412,8.59479 -6.646788,5.9654 -17.2941,6.08916 -21.603666,2.1587 m 51.848796,-5.94101 c -4.0683,-5.3326 -5.77943,-21.02977 -3.12678,-33.485679 0.99285,-4.66204 2.9074,-14.37065 9.06779,-13.86235 5.99482,0.49464 6.64752,10.05182 6.16188,14.40244 -1.46223,13.099379 -6.02971,27.892249 -12.10289,32.945589 m 62.65064,-30.245129 c -4.18242,5.443819 -16.19427,7.132529 -17.60299,11.400269 -0.37745,1.14345 2.98336,7.05548 3.32306,9.12321 1.22193,7.43792 0.20494,21.62895 -11.10438,20.78395 -5.78209,-0.43203 -9.04603,-5.35631 -9.63039,-9.98212 -0.22886,-1.81156 -0.20357,-3.99342 -2.28121,-4.01109 -1.98527,-0.0169 -2.9167,1.41793 -3.89442,2.95425 -1.7827,2.80123 -4.65735,7.70138 -8.49811,9.31825 -6.5559,2.75986 -10.62699,-2.15381 -13.50229,-5.02086 -3.08392,2.7262 -8.81462,8.96508 -16.20275,6.1773 -5.841849,-2.20431 -6.742606,-6.31653 -9.181557,-9.41785 m 52.388887,-5.40091 c 0.98171,-4.99122 3.3761,-14.37964 11.34193,-14.58248 2.68033,-0.0682 4.06615,-0.34465 6.4811,0 m -136.103099,12.9622 c -2.552833,4.60455 -3.221183,10.26333 -3.24055,17.28294 m 95.056129,-11.34193 v 3.78064";

  useEffect(() => {
    if (pathRef.current) {
      const bbox = pathRef.current.getBBox();
      const padding = 20; 
      setViewBox(`${bbox.x - padding} ${bbox.y - padding} ${bbox.width + padding * 2} ${bbox.height + padding * 2}`);
    }
  }, []);

  return (
    <div style={{ ...styles.container, backgroundColor: bgTheme }}>
      {/* La fenêtre garde désormais un fond blanc rétro (#fff) fixe */}
      <div style={styles.window}>
        
        <div style={styles.titleBar}>
          <div style={styles.closeBox} />
          <div style={styles.titleLinesLeft} />
          <span style={styles.windowTitle}>APPLE PAINT v1.0</span>
          <div style={styles.titleLinesRight} />
        </div>

        <div style={styles.content}>
          <svg 
            width="100%" 
            height="100%" 
            viewBox={viewBox} 
            style={{ 
              width: '100%',
              height: '100%',
              shapeRendering: 'crispEdges'
            }}
          >
            <motion.path
              ref={pathRef}
              d={classicMacHello}
              fill="transparent"
              stroke="black"
              strokeWidth="4" 
              strokeLinecap="square"
              strokeLinejoin="miter"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 3.5, ease: "linear" }}
            />
          </svg>
        </div>
      </div>

      <style>{`
        html, body, #root {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          height: 100% !important;
          overflow: hidden !important;
          background-color: ${bgTheme};
        }
        * {
          box-sizing: border-box !important;
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: '"Courier New", Courier, monospace',
    imageRendering: 'pixelated',
    userSelect: 'none',
    overflow: 'hidden',
  },
  window: {
    width: '540px',
    height: '420px',
    border: '2px solid #000',
    boxShadow: '6px 6px 0px #000',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff', // Forcé en blanc pour l'esthétique Mac OS Classic
  },
  titleBar: {
    height: '24px',
    borderBottom: '2px solid #000',
    display: 'flex',
    alignItems: 'center',
    padding: '0 8px',
    backgroundColor: '#ffffff',
  },
  closeBox: {
    width: '10px',
    height: '10px',
    border: '2px solid #000',
    backgroundColor: '#ffffff',
    marginRight: '12px',
  },
  windowTitle: {
    fontWeight: 'bold',
    fontSize: '12px',
    padding: '0 12px',
    textAlign: 'center',
    backgroundColor: '#ffffff',
  },
  titleLinesLeft: {
    flexGrow: 1,
    height: '8px',
    borderTop: '2px double #000',
    borderBottom: '2px double #000',
  },
  titleLinesRight: {
    flexGrow: 4,
    height: '8px',
    borderTop: '2px double #000',
    borderBottom: '2px double #000',
  },
  content: {
    margin: '15px 25px 25px 25px',
    padding: '20px',
    border: '2px solid #000',
    backgroundColor: '#ffffff', 
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    boxSizing: 'border-box',
    boxShadow: 'inset 2px 2px 0px rgba(0,0,0,0.1)'
  }
};

export default ApplePaint;