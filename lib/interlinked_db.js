import * as Fs from 'fs';
import * as Path from 'path';

export class InterlinkedDB {
  #timeout;
  #entries;
  #newEntries;
  #scheduledRemoval;
  #dbPath;

  constructor(path) {
    process.on('SIGINT', () => clearTimeout(this.#timeout));
    process.on('SIGTERM', () => clearTimeout(this.#timeout));
    this.#dbPath = path;
    this.#entries = {};
    this.#newEntries = {};
    this.#scheduledRemoval = {};
    this._schedule();
  }

  _schedule() {
    this.#scheduledRemoval = this.#newEntries;
    this.#newEntries = {};
    this.#timeout = setTimeout(() => this._remove(), 30000);
  };

  _remove() {
    Object.keys(this.#scheduledRemoval).forEach((name) => delete this.#entries[name]);
    this.#scheduledRemoval = {};
    this.#timeout = setTimeout(() => this._schedule(), 30000);
  }

  _register(name, data) {
    this.#entries[name] = data;
    this.#newEntries[name] = null;
  }

  get(name, template = undefined) {
    name = name.replace('/', Path.sep);
    const path = Path.join(this.#dbPath, name);
    var data = this.#entries[path];
    if (data === undefined) {
      if (Fs.existsSync(path)) {
        data = JSON.parse(Fs.readFileSync(path, 'utf8'));
      } else {
        return JSON.parse(JSON.stringify(template));
      }
    }
    if (this.#scheduledRemoval[path] != null) {
      delete this.#scheduledRemoval[path];
    }
    this._register(path, data);
    return data;
  }

  set(name, data) {
    name = name.replace('/', Path.sep);
    const path = Path.join(this.#dbPath, name);
    const dirname = Path.dirname(path);
    if (this.#scheduledRemoval[path] != null) {
      delete this.#scheduledRemoval[path];
    }
    this._register(path, data);
    if (!Fs.existsSync(dirname)) {
      Fs.mkdirSync(dirname, { recursive: true });
    }
    Fs.writeFileSync(path, JSON.stringify(data));
  }

  /*
  remove(name) {
    if (this.#entries[name] === undefined) return;
    delete this.#entries[name];
    delete this.#newEntries[name];
    delete this.#scheduledRemoval[name];
  }
  */
}
