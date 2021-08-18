import agendaDatabase from './agendaDatabase';
import app from './app';
import artistDatabase from './artistDatabase';
import auth from './auth';
import aws from './aws';
import customerDatabase from './customerDatabase';
import customerFeedDatabase from './customerFeedDatabase';
import followDatabase from './followDatabase';
import genreDatabase from './genreDatabase';
import locationDatabase from './locationDatabase';
import postDatabase from './postDatabase';
import reactionDatabase from './reactionDatabase';
import tagDatabase from './tagDatabase';
import userDatabase from './userDatabase';
import validationHash from './verificationHash';

export default [
  app,
  auth,
  aws,
  validationHash,
  userDatabase,
  artistDatabase,
  customerDatabase,
  followDatabase,
  reactionDatabase,
  postDatabase,
  genreDatabase,
  tagDatabase,
  agendaDatabase,
  locationDatabase,
  customerFeedDatabase,
];
