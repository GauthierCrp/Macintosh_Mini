import { motion } from 'framer-motion';

const HappyMac = () => {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <svg 
        width="100%" 
        height="100%" 
        viewBox="1 0 13 13" 
        shapeRendering="crispEdges"
        style={{ maxWidth: '450px', maxHeight: '450px' }}
      >
        {/* Yeux (3 pixels de haut) */}
        <motion.rect 
          x={3} y={2} width={1} height={2} fill="black" 
          animate={{ scaleY: [1, 0.1, 1] }} 
          transition={{ repeat: Infinity, duration: 0.5, repeatDelay: 4 }} 
        />
        <motion.rect 
          x={11} y={2} width={1} height={2} fill="black" 
          animate={{ scaleY: [1, 0.1, 1] }} 
          transition={{ repeat: Infinity, duration: 0.5, repeatDelay: 4 }} 
        />
        
        {/* Nez (6 pixels de haut, orienté vers la gauche) */}
        {/* Barre verticale */}
        <rect x={7} y={2} width={1} height={5} fill="black" />
        {/* Petit retour vers la gauche */}
        <rect x={6} y={6} width={1} height={1} fill="black" />
        
        {/* Bouche (2 coins + base) */}
        <rect x={4} y={8} width={1} height={1} fill="black" />
        <rect x={5} y={9} width={4} height={1} fill="black" />
        <rect x={9} y={8} width={1} height={1} fill="black" />
      </svg>

      {/* RE-SET DES MARGES GLOBALES */}
      <style>
        {`
          html, body, #root {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: 100% !important;
            overflow: hidden !important;
            background-color: #ffffff;
          }

          * {
            box-sizing: border-box !important;
          }

          @keyframes blink {
            0%, 49% { opacity: 1; }
            50%, 100% { opacity: 0; }
          }

          .retro-blink {
            animation: blink 1s infinite;
          }
        `}
      </style>
    </div>
  );
};

export default HappyMac;