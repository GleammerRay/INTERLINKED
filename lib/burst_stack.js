export class BurstStack {
  #active;
  #paused;
  #currentTimeout;
  #timeout;
  #stack;

  constructor(timeout, stack = null) {
    this.#active = false;
    this.#paused = false;
    this.#timeout = timeout;
    if (stack == null) stack = {};
    this.#stack = stack;
  }

  set(name, command) {
    this.#stack[name] = command;
    if (this.#paused) {
      this.#paused = false;
      this.#currentTimeout = setTimeout(() => this._mainLoop(), this.#timeout);
    }
  }
  
  get(name) {
    return this.#stack[name];
  }

  remove(name) {
    delete this.#stack[name];
  }

  _mainLoop() {
    var _stack = Object.values(this.#stack);
    if (_stack.length == 0) {
      this.#paused = true;
      return;
    }
    this.#stack = {};
    _stack.forEach((value) => value());
    if (!this.#active) return;
    this.#currentTimeout = setTimeout(() => this._mainLoop(), this.#timeout);
  }

  start() {
    if (this.#active) return;
    this.#active = true;
    this._mainLoop();
  }

  stop() {
    this.#active = false;
    this.#paused = false;
    clearTimeout(this.#currentTimeout);
    this.#currentTimeout = undefined;
    Object.values(this.#stack).forEach((value) => value());
    this.#stack = {};
  }
}

export class BurstStackManager {
  #stacks;

  constructor() {
    this.#stacks = {};
  }

  get(frequency) {
    var stack = this.#stacks[frequency];
    if (stack == null) {
      stack = new BurstStack(frequency);
      stack.start();
      this.#stacks[frequency] = stack;
    }
    return stack;
  }

  start() {
    for (const stack of Object.values(this.#stacks)) {
      stack.start();
    }
  }

  stop() {
    for (const stack of Object.values(this.#stacks)) {
      stack.stop();
    }
  }
}
