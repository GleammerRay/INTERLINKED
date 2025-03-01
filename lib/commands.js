export class CommandInitOptions {
  rest;
  db;
  burstStackManager;

  constructor(rest, db, burstStackManager) {
    this.rest = rest;
    this.db = db;
    this.burstStackManager = burstStackManager;
  }
}
