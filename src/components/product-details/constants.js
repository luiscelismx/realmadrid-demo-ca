// Constantes para identificar pestañas
export const GENERAL_TAB = 'general';
export const VARIANTS_TAB = 'variants';

// Estilos para componentes
export const STYLES = {
  metadataPanel: {
    container: { 
      height: '100%', 
      marginLeft: '48px', 
      paddingTop: '12px' 
    },
    flexRow: { 
      display: 'flex', 
      gap: '4px' 
    }
  },
  collapsibleSection: {
    container: { 
      marginBottom: '32px' 
    },
    header: { 
      display: 'flex', 
      alignItems: 'center', 
      cursor: 'pointer',
      borderBottom: '1px solid #e0e0e0',
      paddingBottom: '16px',
      marginBottom: '16px'
    },
    content: { 
      marginLeft: '32px', 
      marginTop: '16px' 
    }
  },
  layout: {
    flexContainer: { 
      display: 'flex' 
    },
    leftColumn: { 
      width: '60%' 
    },
    rightColumn: { 
      width: '40%' 
    },
    fullWidth: { 
      width: '100%' 
    }
  },
  variantsHeader: {
    container: { 
      display: 'flex', 
      justifyContent: 'space-between', 
      marginBottom: '24px' 
    },
    rightAlign: { 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'flex-end' 
    },
    buttonContainer: { 
      marginTop: '16px' 
    }
  },
  pagination: {
    container: { 
      display: 'flex', 
      justifyContent: 'space-between', 
      marginTop: '16px', 
      alignItems: 'center' 
    },
    select: { 
      padding: '8px', 
      borderRadius: '4px', 
      border: '1px solid #ddd' 
    },
    label: { 
      marginLeft: '8px' 
    },
    button: { 
      padding: '8px 12px', 
      marginRight: '8px', 
      borderRadius: '4px', 
      border: '1px solid #ddd',
      background: 'white'
    },
    input: { 
      width: '40px', 
      textAlign: 'center',
      padding: '8px',
      borderRadius: '4px',
      border: '1px solid #ddd',
      margin: '0 8px'
    },
    text: { 
      margin: '0 8px' 
    }
  },
  categories: {
    container: { 
      maxWidth: '80%' 
    }
  },
  description: {
    container: { 
      marginTop: '24px' 
    }
  }
}; 