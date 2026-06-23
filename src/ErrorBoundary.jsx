import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Crash intercepté par le pare-feu Mac OS:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.box}>
            <div style={styles.bombIcon}>💣</div>
            <p style={styles.title}>UNE ERREUR S'EST PRODUITE.</p>
            <p style={styles.subtitle}>L'APPLICATION A QUITTÉ INATTENDUEMENT.</p>
            <button 
              onClick={() => {
                this.setState({ hasError: false });
                if (this.props.onNext) this.props.onNext();
              }} 
              style={styles.button}
            >
              PASSER À LA SUIVANTE
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#fff', fontFamily: '"Courier New", monospace'
  },
  box: {
    border: '2px solid #000', padding: '20px', textAlign: 'center', boxShadow: '4px 4px 0px #000',
    width: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px'
  },
  bombIcon: { fontSize: '40px', margin: '0' },
  title: { fontWeight: '900', fontSize: '14px', margin: 0 },
  subtitle: { fontSize: '11px', fontWeight: 'bold', margin: 0 },
  button: {
    padding: '6px 12px', border: '2px solid #000', backgroundColor: '#fff', fontWeight: 'bold',
    cursor: 'pointer', boxShadow: '2px 2px 0px #000', outline: 'none', fontSize: '11px'
  }
};

export default ErrorBoundary;