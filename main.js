import { createElement,render } from "./micro-react";

const element = createElement(
  'h1',
  {id:'h1-1',title:'hello',class:'h1-class',style:'background-color:red'},
  'Hello World',
  createElement('h2')
)

const container = document.querySelector('#root');

render(element,container);

console.log(element);