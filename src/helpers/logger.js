/**
 * Sistema de logging para la aplicación
 * Permite diferentes niveles de log y registra componente y mensaje
 */

// Niveles de log disponibles
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

// Nivel actual del logger (configurable)
let currentLogLevel = LOG_LEVELS.INFO;

// Colores para los diferentes niveles en la consola
const COLORS = {
  ERROR: 'color: #FF5252; font-weight: bold',
  WARN: 'color: #FFB300; font-weight: bold',
  INFO: 'color: #2196F3; font-weight: bold',
  DEBUG: 'color: #4CAF50',
};

/**
 * Establece el nivel de log para la aplicación
 * @param {string} level - Nivel de log ('ERROR', 'WARN', 'INFO', 'DEBUG')
 */
const setLogLevel = (level) => {
  if (LOG_LEVELS[level] !== undefined) {
    currentLogLevel = LOG_LEVELS[level];
    info('Logger', `Nivel de log cambiado a: ${level}`);
  } else {
    warn('Logger', `Nivel de log inválido: ${level}`);
  }
};

/**
 * Formatea un mensaje de log
 * @param {string} level - Nivel de log
 * @param {string} component - Nombre del componente
 * @param {string} message - Mensaje a registrar
 * @returns {string} - Mensaje formateado
 */
const formatMessage = (level, component, message) => {
  return `%c[${level}]%c [${component}]: ${message}`;
};

/**
 * Registra un mensaje de error
 * @param {string} component - Nombre del componente
 * @param {string} message - Mensaje a registrar
 */
const error = (component, message) => {
  if (currentLogLevel >= LOG_LEVELS.ERROR) {
    console.error(
      formatMessage('ERROR', component, message),
      COLORS.ERROR,
      'color: inherit'
    );
  }
};

/**
 * Registra un mensaje de advertencia
 * @param {string} component - Nombre del componente
 * @param {string} message - Mensaje a registrar
 */
const warn = (component, message) => {
  if (currentLogLevel >= LOG_LEVELS.WARN) {
    console.warn(
      formatMessage('WARN', component, message),
      COLORS.WARN,
      'color: inherit'
    );
  }
};

/**
 * Registra un mensaje informativo
 * @param {string} component - Nombre del componente
 * @param {string} message - Mensaje a registrar
 */
const info = (component, message) => {
  if (currentLogLevel >= LOG_LEVELS.INFO) {
    console.info(
      formatMessage('INFO', component, message),
      COLORS.INFO,
      'color: inherit'
    );
  }
};

/**
 * Registra un mensaje de depuración
 * @param {string} component - Nombre del componente
 * @param {string} message - Mensaje a registrar
 */
const debug = (component, message) => {
  if (currentLogLevel >= LOG_LEVELS.DEBUG) {
    console.log(
      formatMessage('DEBUG', component, message),
      COLORS.DEBUG,
      'color: inherit'
    );
  }
};

// Exporta el logger
export default {
  setLogLevel,
  LOG_LEVELS,
  error,
  warn,
  info,
  debug,
}; 