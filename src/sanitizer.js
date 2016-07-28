import trim from 'lodash/trim';

export default class Sanitizer {
  constructor($) {
    this.$ = $;
  }

  text(node) {
    const value = trim(node.text());
    return value;
    // const temp = value.toLowerCase();
    // return (temp === '(por asignar)' || temp === 'por fijar') ? fallback : value;
  }

  number(node) {
    const value = this.text(node);
    return Number(value);
  }

  boolean(node) {
    const value = this.text(node);
    return value && value.toUpperCase() === 'SI'
  }
}
