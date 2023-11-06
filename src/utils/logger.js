import winston from "winston";

const customLevelsOptions = {
  levels: {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    http: 4,
    debug: 5,
  },
  colors: {
    fatal: "red",
    error: "yellow",
    warning: "magenta",
    info: "blue",
    http: "green",
    debug: "grey",
  },
};

const logLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

const transports = [
  new winston.transports.Console({
    level: logLevel,
    format: winston.format.combine(
      winston.format.colorize({ colors: customLevelsOptions.colors }),
      winston.format.simple()
    )
  })
];

if (process.env.NODE_ENV === 'production') {
  // Agrega el transporte de archivo solo en producción
  transports.push(
    new winston.transports.File({
      filename: './errors.log',
      level: 'error',
      format: winston.format.simple()
    })
  );
}

const logger = winston.createLogger({
  levels: customLevelsOptions.levels,
  transports
});

export default logger;

